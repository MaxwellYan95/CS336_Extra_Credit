import sys
import pandas as pd
from sqlalchemy import create_engine
import urllib.parse
import json

# --- Database Credentials ---
DB_USER = "my463"
DB_PASS = ""   # Ensure this is filled in on the server
DB_HOST = "postgres.cs.rutgers.edu"
DB_NAME = "my463"

def get_connection():
    safe_password = urllib.parse.quote_plus(DB_PASS)
    safe_user = urllib.parse.quote_plus(DB_USER)
    return create_engine(f"postgresql+psycopg2://{safe_user}:{safe_password}@{DB_HOST}/{DB_NAME}")

def run_query(query):
    try:
        engine = get_connection()
        df = pd.read_sql(query, engine)
        if df.empty:
            print(json.dumps({"error": "Query returned no results."}))
        else:
            # Output JSON for the frontend to parse easily
            print(df.to_json(orient='records', date_format='iso'))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        run_query(query)
    else:
        print(json.dumps({"error": "No query provided."}))