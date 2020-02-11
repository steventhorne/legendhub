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
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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
            '%s://%s:%s@%s:%s/%s' % (
                "mysql+pymysql",
                os.environ["MYSQL_USER"],
                os.environ["MYSQL_PASSWORD"],
                os.environ["MYSQL_HOST"],
                os.environ["MYSQL_PORT"],
                os.environ["MYSQL_DATABASE"]
            )
        )

    def get_engine(self):
        """ Gets the sqlalchemy.engine.Engine object for this class """
        return self.engine

    def get_session(self):
        """ Gets a sql session

        Returns:
            A sessionmaker session from sqlalchemy
        """
        return sessionmaker(bind=self.engine)()
