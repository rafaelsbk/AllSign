from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_alter_contract_equipment_value_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="ALTER TABLE users_contract ALTER COLUMN custom_data DROP NOT NULL;",
            reverse_sql="ALTER TABLE users_contract ALTER COLUMN custom_data SET NOT NULL;",
        ),
        migrations.RunSQL(
            sql="ALTER TABLE users_contract ALTER COLUMN template_id DROP NOT NULL;",
            reverse_sql="ALTER TABLE users_contract ALTER COLUMN template_id SET NOT NULL;",
        ),
    ]
