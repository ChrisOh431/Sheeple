const natural = require('natural');
const SW = require('stopword');

const { WordTokenizer } = natural;
const { SentimentAnalyzer, PorterStemmer } = natural;

const aposToLexForm = require("apos-to-lex-form");

function Sentilyze(text) {
    if (text) {
        const lexedReview = aposToLexForm(text);
        const casedReview = lexedReview.toLowerCase();
        const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

        const tokenizer = new WordTokenizer();
        const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);
        const filteredReview = SW.removeStopwords(tokenizedReview);

        const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
        const analysis = analyzer.getSentiment(filteredReview);

        return { text: text, sent: analysis };
    }

    return {text: "", sent: 0.0};
}


module.exports = { Sentilyze };