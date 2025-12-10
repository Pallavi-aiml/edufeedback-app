// backend/controllers/feedbackController.js

const axios = require('axios');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

// @desc   Submit detailed feedback
// @route  POST /api/feedback
const submitFeedback = async (req, res) => {
    const {
        courseId, rating, feedback, semester, workload, difficulty
    } = req.body;

    if (!courseId || !rating || !rating.overall || !rating.instructor || !rating.content ||
        !feedback || !semester || !workload || !difficulty) {
        return res.status(400).json({ success: false, message: 'Missing required feedback fields.' });
    }

    try {
        const sentimentResponse = await axios.post(`${process.env.PYTHON_API_URL}/analyze`, { text: feedback });
        const sentiment = sentimentResponse.data.sentiment;

        const newFeedback = new Feedback({
            course: courseId, student: req.user._id, institution: req.user.institution,
            semester, ratings: rating, workload, difficulty, feedback, sentiment,
        });

        await newFeedback.save();
        console.log("Detailed feedback saved for institution:", req.user.institution);
        res.status(201).json({ success: true, message: 'Feedback submitted', data: { sentiment } });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        if (error.isAxiosError) {
             return res.status(500).json({ success: false, message: 'Error analyzing sentiment.' });
        }
        res.status(500).json({ success: false, message: 'Error saving feedback.' });
    }
};

// @desc   Get detailed analytics with Sentiment Breakdown
// @route  GET /api/feedback/analytics
const getAnalytics = async (req, res) => {
    try {
        const institutionId = new mongoose.Types.ObjectId(req.user.institution);

        const analyticsPipeline = [
            { $match: { institution: institutionId } },
            { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseDetails' } },
            { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    // 1. General Stats
                    generalStats: [
                        {
                            $group: {
                                _id: null, totalFeedback: { $sum: 1 },
                                avgOverall: { $avg: "$ratings.overall" },
                                avgInstructor: { $avg: "$ratings.instructor" },
                                avgContent: { $avg: "$ratings.content" },
                            },
                        },
                    ],
                    // 2. Course Stats (for lists and sentiment bars)
                    courseStats: [
                        {
                            $group: {
                                _id: "$course", 
                                code: { $first: "$courseDetails.courseCode" },
                                instructor: { $first: "$courseDetails.instructor" },
                                avgRating: { $avg: "$ratings.overall" }, 
                                count: { $sum: 1 },
                                positiveCount: { $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] } },
                                neutralCount: { $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] } },
                                negativeCount: { $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] } }
                            },
                        },
                        { $match: { code: { $ne: null } } }, { $sort: { avgRating: -1 } },
                    ],
                    // 3. NEW: Detailed Sentiment Breakdown for Pie Chart Tooltip
                    sentimentBreakdown: [
                        {
                            // First, group by Sentiment AND Course details
                            $group: {
                                _id: { 
                                    sentiment: "$sentiment", 
                                    courseCode: "$courseDetails.courseCode", 
                                    instructor: "$courseDetails.instructor", 
                                    semester: "$courseDetails.semester", 
                                    dept: "$courseDetails.department" 
                                },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            // Then, push these course details into a list for each sentiment
                            $group: {
                                _id: "$_id.sentiment",
                                courses: { 
                                    $push: { 
                                        code: "$_id.courseCode",
                                        instructor: "$_id.instructor",
                                        sem: "$_id.semester",
                                        dept: "$_id.dept",
                                        count: "$count"
                                    } 
                                }
                            }
                        }
                    ]
                },
            },
        ];

        const results = await Feedback.aggregate(analyticsPipeline);

        if (!results || results.length === 0 || !results[0].generalStats || results[0].generalStats.length === 0) {
             return res.json({
                 success: true, totalFeedback: 0,
                 averageRating: { overall: '0.0', instructor: '0.0', content: '0.0' },
                 sentimentCount: { positive: 0, neutral: 0, negative: 0 },
                 sentimentDetails: { positive: [], neutral: [], negative: [] }, // Return empty details
                 topCourses: [], needsAttention: [],
             });
        }

        const analytics = results[0];
        const generalStats = analytics.generalStats[0];
        const courseStats = analytics.courseStats || [];

        // --- Process Sentiment Details ---
        const sentimentDetails = { positive: [], neutral: [], negative: [] };
        let positiveCount = 0;
        let neutralCount = 0;
        let negativeCount = 0;

        if (analytics.sentimentBreakdown) {
            analytics.sentimentBreakdown.forEach(item => {
                if (item._id === 'positive') {
                    sentimentDetails.positive = item.courses;
                    positiveCount = item.courses.reduce((acc, curr) => acc + curr.count, 0);
                }
                if (item._id === 'neutral') {
                    sentimentDetails.neutral = item.courses;
                    neutralCount = item.courses.reduce((acc, curr) => acc + curr.count, 0);
                }
                if (item._id === 'negative') {
                    sentimentDetails.negative = item.courses;
                    negativeCount = item.courses.reduce((acc, curr) => acc + curr.count, 0);
                }
            });
        }

        const formatAvg = (avg) => avg ? avg.toFixed(1) : '0.0';

        const needsAttention = courseStats
            .filter(c => c.avgRating !== null && c.avgRating < 3.6)
            .sort((a, b) => a.avgRating - b.avgRating)
            .slice(0, 4).map(c => ({...c, avgRating: formatAvg(c.avgRating)}));

        const topCourses = courseStats.slice(0, 4).map(c => ({...c, avgRating: formatAvg(c.avgRating)}));

        res.json({
            success: true,
            totalFeedback: generalStats.totalFeedback,
            averageRating: {
                overall: formatAvg(generalStats.avgOverall),
                instructor: formatAvg(generalStats.avgInstructor),
                content: formatAvg(generalStats.avgContent),
            },
            // Send counts AND details
            sentimentCount: { positive: positiveCount, neutral: neutralCount, negative: negativeCount },
            sentimentDetails, 
            topCourses,
            needsAttention,
        });

    } catch (err) {
        console.error("Error generating analytics:", err);
        res.status(500).json({ success: false, message: "Failed to get analytics" });
    }
};

module.exports = { submitFeedback, getAnalytics };