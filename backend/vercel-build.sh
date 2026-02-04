#!/bin/bash
echo "🚀 Vercel Build Script"
echo "====================="

# Install dependencies
pip install -r requirements.txt

# Apply DjangoSaver patch
echo "🔧 Applying DjangoSaver patch..."
python -c "
import os
import sys
sys.path.insert(0, os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    import django
    django.setup()
    
    from api.monkey_patches.django_saver_complete_replacement import apply_complete_replacement
    
    if apply_complete_replacement():
        print('✅ DjangoSaver patch applied successfully')
    else:
        print('❌ DjangoSaver patch failed')
        
except Exception as e:
    print(f'⚠ Error: {e}')
"

# Collect static files
python manage.py collectstatic --noinput

echo "✅ Build complete"