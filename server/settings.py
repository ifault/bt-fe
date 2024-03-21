TORTOISE_ORM = {
    'connections': {
        "default": {
            "engine": "tortoise.backends.sqlite",
            "credentials": {
                "file_path": 'database/db.sqlite3',
            },
        }
    },
    'apps': {
        'models': {
            'models': ['models'],
            'default_connection': 'default'
        }
    },
    'use_tz': False,
    'timezone': 'Asia/Shanghai'
}
