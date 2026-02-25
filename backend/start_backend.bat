@echo off
echo Setting up Python Environment for Imagen...
python -m venv venv
call venv\Scripts\activate.bat
echo Installing dependencies (this will take a while)...
pip install torch --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
echo Dependencies installed. Starting the local backend!
echo WARNING: On first run, downloading the AI model will take several gigabytes of space and bandwidth.
python main.py
pause
