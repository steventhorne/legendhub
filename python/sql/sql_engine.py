"""
MIT License

Copyright (c) 2018 steventhorne

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sql_engine_config as conf

class SqlEngine(object):
    """ Used for connecting to sql.

    Connects to sql server using sqlalchemy module.
    Is a database-agnostic implementation configurable
    via the attributes in this class.

    Attributes:
        engine: The sqlalchemy engine used for communicating with the sql db
    """

    def __init__(self):
        """ Creates an instance of the SqlEngine class """
        self.engine = create_engine(
            '%s://%s:%s@%s:%d/%s' % (
                conf.DB_ENGINE,
                conf.DB_USERNAME,
                conf.DB_PASSWORD,
                conf.DB_HOSTNAME,
                conf.DB_PORT,
                conf.DB_DATABASE
            )
        )

    def get_session(self):
        """ Gets a sql session

        Returns:
            A sessionmaker session from sqlalchemy
        """
        return sessionmaker(bind=self.engine)()
