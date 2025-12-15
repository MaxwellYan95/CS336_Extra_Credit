# How to set up program?

Type these commands in the local machine terminal
1) python3.11 -m venv .venv
2) source .venv/bin/activate
3) cd Backend
4) pip install -r packages.txt

Move ilab_script_extra.py to your ilab machine
1) ilab_script_extra.py is in Backend folder

Type these commands in the ilab machine terminal
1) Go to the directory where you stored the ilab_script_extra.py
2) python3.11 -m venv .venv
3) source .venv/bin/activate
4) pip install pandas sqlalchemy psycopg2-binary

Change variables in .py files
1) Go to the ilab_script_extra.py file in the ilab machine and change these variables --> DB_USER, DB_PASS, DB_HOST, DB_NAME. Make sure you get the connection of your ilab database.
2) Go to the database_llm.py file in the local machine and change these variables --> REMOTE_SCRIPT_PATH, ENV_ACTIVATE_PATH. REMOTE_SCRIPT_PATH is the path of the ilab_script_extra.py in your ilab machine. ENV_ACTIVATE_PATH is the path of the new environment you created in your ilab machine. 

# How to run the program?

1) Open 2 separate terminals
2) In the 1st terminal, run these commands: "cd Backend" and "python database_llm.py"
3) In the 2nd terminal, run these commands: "cd Frontend" and "npm start"

# Troubleshoot Note
If you have a port number ERROR, type these commands: "sudo lsof -i :5000" and "kill -9 YOUR_PID"

# Transcript of GEMINI Chats
1) I want a Python program to be displayed on a working front end. Right now, I’m using React as my frontend. My Python program is a LLM that takes a regular sentence, converts that sentence into an SQL query, extracts data from an SQL database, and then returns back a series that represents a table that came from the SQL query. In the frontend, I want a textbox that the user can use to enter the input. Additionally, I want an interactive table that displays the final result. Show me all of the files that I need. 

2) I want to create a separate login page. This page will have 2 text boxes which will fill in the values for ILAB_PASS and ILAB_USER from database.py. Give me the typescript code to achieve that. 

3) I realized that sometimes the table display would have too many columns which would make the table super horizontally wide. I want to have a scrollbar. I want the scrollbar to be located on top of the table. Additionally, I want a vertical scrollbar because the table would sometimes have a lot of rows. 
