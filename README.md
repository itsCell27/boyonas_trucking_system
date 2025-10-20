# Boyonas Trucking Service System

This is a web-based trucking service system designed to manage trucking operations, including fleet management, employee management, and service operations.

## Tech Stack

**Frontend:**

*   HTML
*   CSS
*   JavaScript
*   React
*   Vite
*   Tailwind CSS
*   Lucide React (for icons)

**Backend:**

*   PHP
*   MySQL
*   Composer

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Before you begin, make sure you have the following software installed on your machine:

*   **Node.js and npm:** You can download them from [https://nodejs.org/](https://nodejs.org/).
*   **XAMPP:** This will provide you with Apache, MySQL, and PHP. You can download it from [https://www.apachefriends.org/](https://www.apachefriends.org/).
*   **Composer:** This is a dependency manager for PHP. You can download it from [https://getcomposer.org/](https://getcomposer.org/).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/react_trucking_system.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd react_trucking_system
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd frontend
    npm install
    ```

4.  **Install backend dependencies:**

    ```bash
    cd ../backend
    composer install
    ```

### Configuration

1.  **Start XAMPP:** Open the XAMPP control panel and start the Apache and MySQL modules.

2.  **Create and import the database:**

    *   Open your web browser and navigate to `http://localhost/phpmyadmin/`.
    *   Create a new database named `trucking_system`.
    *   Select the `trucking_system` database and go to the **Import** tab.
    *   Click on **Choose File** and select the `trucking_system.sql` file located in the `backend/database` directory.
    *   Click on **Go** to import the database.

3.  **Configure the backend:**

    *   In the `backend` directory, create a new file named `.env`.
    *   Copy the contents of `.env.example` (if it exists) or add the following content to the `.env` file:

        ```
        DB_HOST=localhost
        DB_USERNAME=root
        DB_PASSWORD=
        DB_DATABASE=trucking_system
        ```

### Running the Application

1.  **Run the frontend:**

    ```bash
    cd frontend
    npm run dev
    ```

    This will start the frontend development server, and you can view the application at `http://localhost:5173` (the port may vary).

2.  **Backend:**

    The backend is served by the Apache server from XAMPP. Make sure the project is in the `htdocs` directory of your XAMPP installation.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request