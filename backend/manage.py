#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import subprocess

def main():
    """Run administrative tasks."""
    # --- AUTO-VENV FIX ---
    # Automatically switch to venv python if not already using it
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base_dir, 'venv', 'Scripts', 'python.exe')

    if os.path.exists(venv_python) and sys.executable.lower() != venv_python.lower():
        # Only switch if we are NOT in a recursion loop
        if os.environ.get('IN_VENV_WRAPPER') != '1':
            os.environ['IN_VENV_WRAPPER'] = '1'
            print(f"--- [FIX] Rerunning server using Virtual Environment Python ---")
            result = subprocess.run([venv_python] + sys.argv)
            sys.exit(result.returncode)
    # ---------------------

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
