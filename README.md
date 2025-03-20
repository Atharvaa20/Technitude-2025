# Adaptive GenAI System

A versatile GenAI-powered system that adapts between restaurant ordering and clinic appointment booking use cases.

## Features

- Dual-mode interface switching between restaurant and clinic contexts
- Modern, responsive UI built with React and Material-UI
- FastAPI backend with GenAI integration
- Real-time query processing and responses

## Project Structure
```
.
├── backend/
│   └── main.py         # FastAPI backend server
├── frontend/
│   ├── package.json    # Frontend dependencies
│   └── src/
│       └── App.jsx     # Main React component
└── requirements.txt    # Python dependencies
```

### Running the GenAI Restaurant and Clinic App Locally

#### Prerequisites
1. **Python 3.9 or higher**: Ensure you have Python installed on your machine. You can download it from [python.org](https://www.python.org/downloads/).
2. **Node.js and npm**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
3. **Virtual Environment**: It's recommended to use a virtual environment for Python dependencies.

#### Steps to Run the Application

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd GenAI_Restaurant_Clinic_App
   ```

2. **Set Up the Backend**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment:
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     - On Windows:
       ```bash
       venv\Scripts\activate
       ```
     - On macOS/Linux:
       ```bash
       source venv/bin/activate
       ```
   - Install the required Python packages:
     ```bash
     pip install -r requirements.txt
     ```
   - Create a `.env` file in the `backend` directory and add your `GOOGLE_API_KEY`:
     ```
     GOOGLE_API_KEY=your_api_key_here
     ```
   - Start the backend server:
     ```bash
     uvicorn main:app --reload
     ```

3. **Set Up the Frontend**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install the required Node.js packages:
     ```bash
     npm install
     ```
   - Start the frontend server:
     ```bash
     npm start
     ```

4. **Access the Application**:
   - Open your web browser and go to `http://localhost:3000` to access the application.

5. **Clear Chat History**:
   - You can clear the chat history for both restaurant and clinic modes using the clear history buttons in the UI.

#### Notes
- Ensure that both the frontend and backend servers are running simultaneously for the application to function correctly.
- If you encounter any issues, check the console for error messages and ensure all dependencies are installed properly.

## Usage

1. Access the web interface at `http://localhost:3000`
2. Toggle between Restaurant and Clinic modes
3. Enter your query in natural language
4. Get AI-powered responses based on the context

## Evaluation Criteria Coverage

- **Portability**: System adapts between restaurant and clinic use cases
- **Code Quality**: Modular structure with clear separation of concerns
- **Versatility**: Extensible architecture for adding new domains
- **Usability**: Clean, intuitive UI with real-time feedback
- **Efficiency**: Optimized API calls and response handling
- **Presentation**: Professional UI with clear mode switching
