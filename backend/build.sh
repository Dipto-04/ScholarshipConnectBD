#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Cleanup old rejected scholarships (30+ days)
python manage.py delete_old_rejected_scholarships
