import sys
from textblob import TextBlob

text = sys.argv[1]
blob = TextBlob(text)

polarity = blob.sentiment.polarity

if polarity > 0:
    print("positive")
elif polarity < 0:
    print("negative")
else:
    print("neutral")
