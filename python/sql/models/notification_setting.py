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
from sqlalchemy import Column, Integer
from sql.models import shared

class NotificationSetting(shared.Base):
    """ ORM class for NotificationSettings

    Attributes:
        id: Identity column.
        member_id: The Id of the Member this setting belongs to.
        item_added: Setting for on item added.
        item_updated: Setting for on item updated.
        mob_added: Setting for on mob added.
        mob_updated: Setting for on mob updated.
        quest_added: Setting for on quest added.
        quest_updated: Setting for on quest updated.
        wiki_page_added: Setting for on wiki page added.
        wiki_page_updated: Setting for on wiki page updated.
        changelog_added: Setting for on changelog added.
    """
    __tablename__ = "NotificationSettings"

    id = Column("Id", Integer, primary_key=True)
    member_id = Column("MemberId", Integer)
    item_added = Column("ItemAdded", Integer)
    item_updated = Column("ItemUpdated", Integer)
    mob_added = Column("MobAdded", Integer)
    mob_updated = Column("MobUpdated", Integer)
    quest_added = Column("QuestAdded", Integer)
    quest_updated = Column("QuestUpdated", Integer)
    wiki_page_added = Column("WikiPageAdded", Integer)
    wiki_page_updated = Column("WikiPageUpdated", Integer)
    changelog_added = Column("ChangelogAdded", Integer)

    def __repr__(self):
        """ Debug representation of the class """
        return ("<NotificationSetting(Id='{}', MemberId='{}', ItemAdded='{}',"
                "ItemUpdated='{}', MobAdded='{}', MobUpdated='{}',"
                "QuestAdded='{}', QuestUpdated='{}', WikiPageAdded='{}',"
                "WikiPageUpdated='{}', ChangelogAdded='{}')").format(
            self.id,
            self.member_id,
            self.item_added,
            self.item_updated,
            self.mob_added,
            self.mob_updated,
            self.quest_added,
            self.quest_updated,
            self.wiki_page_added,
            self.wiki_page_updated,
            self.changelog_added
        )
