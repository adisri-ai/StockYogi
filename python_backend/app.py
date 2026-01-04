from flask import Flask, request, jsonify
import yfinance as yf
from flask_cors import CORS
from fund_screener import calc
app = Flask(__name__)
CORS(app)

@app.route('/historical', methods=['GET'])
def get_historical_data():
    try:
        symbol = request.args.get("symbol")
        period = request.args.get("period", "1mo")
        interval = request.args.get("interval", "1d")

        if not symbol:
            return jsonify({"error": "Symbol is required"}), 400

        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)

        if hist.empty:
            return jsonify({"error": "No data found"}), 404

        data = []
        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"])
            })

        return jsonify({
            "symbol": symbol,
            "period": period,
            "interval": interval,
            "data": data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/fundalloc' , methods=['GET'])
def fund_alloc():
    try:
        x = float(str(request.args.get("x")))
        ans = calc(x)
        return ans
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(port=8000, debug=True)
