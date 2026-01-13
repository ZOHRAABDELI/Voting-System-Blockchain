"""
Gunicorn configuration file for production deployment.
"""

# Server socket
bind = "0.0.0.0:5000"

# Worker processes
workers = 2
worker_class = "sync"
threads = 2

# Timeouts
timeout = 120
keepalive = 5

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"

# Process naming
proc_name = "voting-blockchain-api"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (handled by Render/platform)
keyfile = None
certfile = None
