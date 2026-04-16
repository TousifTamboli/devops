# 🚀 Flask + FastAPI Dockerized Project

A beginner-friendly microservices project using **Flask (frontend/UI)** and **FastAPI (backend/API)**, containerized using **Docker** and orchestrated with **Docker Compose**.

---

# 📌 What You Will Learn

* How to build a simple API using FastAPI
* How to build a UI using Flask
* How services communicate with each other
* How Docker containers work
* How to use Docker Compose for multi-container apps
* Networking and port mapping in Docker

---

# 🧠 Project Architecture

```
Browser (localhost:5001)
        ↓
Flask (UI container)
        ↓ HTTP Request
FastAPI (API container)
        ↓
Response → Flask → Browser
```

---

# 📁 Project Structure

```
flask-fastapi-project/
│
├── fastapi_app.py
├── flask_app.py
├── requirements.txt
├── Dockerfile.fastapi
├── Dockerfile.flask
├── docker-compose.yml
├── templates/
│   └── index.html
```

---

# ⚙️ Technologies Used

* Python
* Flask (UI)
* FastAPI (API)
* Uvicorn (ASGI server)
* Docker
* Docker Compose

---

# 🧠 Important Concepts

## 1. Port Mapping

```
5001:5000
```

* 5001 → your system
* 5000 → inside container

👉 Open browser on `localhost:5001`

---

## 2. Container Networking

* Docker creates a private network
* Services communicate using names

```
http://fastapi:8000
```

👉 `fastapi` = container name

---

## 3. localhost vs Service Name

| Case           | Use       |
| -------------- | --------- |
| Inside Docker  | fastapi   |
| Outside Docker | localhost |

---

## 4. 0.0.0.0 vs 127.0.0.1

| Address   | Meaning                 |
| --------- | ----------------------- |
| 127.0.0.1 | Only inside container   |
| 0.0.0.0   | Accessible from outside |

---

# ▶️ How to Run

### Step 1: Build and start

```bash
docker-compose up --build
```

---

### Step 2: Open in browser

* Flask UI → [http://localhost:5001](http://localhost:5001)
* FastAPI API → [http://localhost:8000/api](http://localhost:8000/api)
* FastAPI Docs → [http://localhost:8000/docs](http://localhost:8000/docs)

---

# 🧪 Troubleshooting

## Port already in use

Change:

```
5000:5000 → 5001:5000
```

---

## Cannot connect to FastAPI

* Ensure both containers are running
* Use `fastapi` (not localhost)

---

## Flask not accessible

Ensure:

```python
app.run(host="0.0.0.0")
```

---

# 🚀 Future Improvements

* Add PostgreSQL database
* Add authentication (JWT)
* Use Gunicorn for production
* Add Nginx reverse proxy
* Deploy on cloud (AWS / Render)

---

# 🧠 Summary

* Flask handles UI
* FastAPI handles API
* Docker runs them separately
* Docker Compose connects them
* Services communicate using names

---

# ⭐ Contribution

Feel free to fork, improve, and use this project for learning!

---

# 📬 Author

Made for learning microservices + Docker 🚀
