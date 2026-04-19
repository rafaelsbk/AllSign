
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_merge_20260416_2029'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE users_contracttemplate ADD COLUMN IF NOT EXISTS category varchar(100) DEFAULT '';",
                "ALTER TABLE users_contracttemplate ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;",
                "ALTER TABLE users_contracttemplate DROP COLUMN IF EXISTS html_content;",
                "ALTER TABLE users_contracttemplate DROP COLUMN IF EXISTS docx_file;",
            ],
            reverse_sql=[
                "ALTER TABLE users_contracttemplate ADD COLUMN IF NOT EXISTS html_content text;",
                "ALTER TABLE users_contracttemplate ADD COLUMN IF NOT EXISTS docx_file varchar(255);",
                "ALTER TABLE users_contracttemplate DROP COLUMN IF EXISTS category;",
                "ALTER TABLE users_contracttemplate DROP COLUMN IF EXISTS content;",
            ]
        ),
    ]
