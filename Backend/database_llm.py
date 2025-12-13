from flask import Flask, request, jsonify
from flask_cors import CORS
import paramiko
import sys
from llama_cpp import Llama
from huggingface_hub import hf_hub_download
import json

app = Flask(__name__)
CORS(app)  # Allow React to talk to this server

# --- Configuration ---
ILAB_HOST = "ilab1.cs.rutgers.edu"
ILAB_USER = "my463"  # Fill this in or use env vars
ILAB_PASS = "HappyFish2025!!" # Fill this in or use env vars
REMOTE_SCRIPT_PATH = "/common/home/my463/cs336_Data/project3/ilab_script_extra.py"
ENV_ACTIVATE_PATH = "/common/home/my463/cs336_Data/project3/ai_env/bin/activate"

# --- Load Model (Global) ---
print("Loading Model...")
model_name = "Qwen/Qwen2.5-3B-Instruct-GGUF"
model_file = "qwen2.5-3b-instruct-q4_k_m.gguf"
model_path = hf_hub_download(repo_id=model_name, filename=model_file)

llm = Llama(
    model_path=model_path,
    n_ctx=32768,
    n_gpu_layers=-1, 
    verbose=False
)

# Load Schema Context
def get_schema_context():
    # Simplified for the example - ensure these files exist locally in the backend folder
    try:
        with open("Database.sql", 'r') as f: db = f.read()
        with open("FeedValues.sql", 'r') as f: feed = f.read()
        return db + "\n" + feed
    except:
        return ""

schema_context = get_schema_context()

def generate_sql(question):
    system_prompt = (
        "You are a strict SQL assistant. Convert the user's question into a valid SQL query "
        "based ONLY on the provided schema.\n"
        "Output ONLY the SQL query. No markdown."
    )
    full_prompt = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\nSchema:\n{schema_context}\nQuestion: {question}<|im_end|>\n<|im_start|>assistant\n```sql"
    
    output = llm(full_prompt, max_tokens=400, stop=["<|im_end|>", ";"], echo=False)
    return output['choices'][0]['text'].strip().replace("```sql", "").replace("```", "").strip()

def execute_on_ilab(sql_query):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(ILAB_HOST, username=ILAB_USER, password=ILAB_PASS)
        
        safe_query = sql_query.replace('"', '\\"')
        full_command = f'source {ENV_ACTIVATE_PATH} && python3 {REMOTE_SCRIPT_PATH} "{safe_query}"'
        
        stdin, stdout, stderr = ssh.exec_command(full_command)
        result_str = stdout.read().decode().strip()
        error_str = stderr.read().decode().strip()
        ssh.close()

        # Try to parse the remote output as JSON
        try:
            # Find the JSON list in the output (in case of other print statements)
            start_idx = result_str.find('[')
            end_idx = result_str.rfind(']') + 1
            if start_idx != -1 and end_idx != -1:
                clean_json = result_str[start_idx:end_idx]
                return json.loads(clean_json), error_str
            elif "error" in result_str.lower():
                 return {"error": result_str}, error_str
            else:
                 return [], error_str # Empty result
        except json.JSONDecodeError:
            return {"error": "Failed to parse remote JSON", "raw": result_str}, error_str

    except Exception as e:
        return {"error": str(e)}, ""

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get('question')
    
    if not question:
        return jsonify({"error": "No question provided"}), 400

    # 1. Generate SQL
    sql_query = generate_sql(question)
    
    # 2. Execute SQL
    table_data, ssh_error = execute_on_ilab(sql_query)
    
    return jsonify({
        "original_question": question,
        "generated_sql": sql_query,
        "table_data": table_data,
        "ssh_error": ssh_error
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)