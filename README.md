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