exports.up = function() {
    return `
        -- Add 'Limited' stat to 'Items'
        ALTER TABLE Items ADD COLUMN IsLimited TINYINT(4);
        ALTER TABLE Items_AuditTrail ADD COLUMN IsLimited TINYINT(4);

        DROP TRIGGER IF EXISTS Items_BEFORE_UPDATE;
        CREATE TRIGGER Items_BEFORE_UPDATE BEFORE UPDATE ON Items
        FOR EACH ROW BEGIN
            IF (@DISABLE_NOTIFICATIONS IS NULL AND NEW.Deleted = OLD.Deleted) THEN
                INSERT INTO Items_AuditTrail (ItemId, Name, Slot, Strength,
                    Mind, Dexterity, Constitution,
                    Perception, Spirit, Ac,
                    StrengthCap, MindCap, DexterityCap,
                    ConstitutionCap, PerceptionCap, SpiritCap,
                    Hit, Dam, Hp, Hpr, Ma, Mar, Mv, Mvr,
                    Spelldam, Spellcrit, ManaReduction,
                    Mitigation, Accuracy, Ammo, TwoHanded,
                    MaxDam, AvgDam, MinDam, Parry, Holdable,
                    Rent, Value, Weight, UniqueWear, Notes,
                    ModifiedBy, ModifiedOn, ModifiedByIP,
                    ModifiedByIPForward, AlignRestriction,
                    Quality, Bonded, Casts,
                    Level, NetStat, RangedAccuracy,
                    Concentration, MobId, QuestId,
                    WeaponType, SpeedFactor, WeaponStat,
                    IsLight, IsHeroic, Soulbound, Deleted, IsLimited)
                VALUES(OLD.Id, OLD.Name, OLD.Slot,
                    OLD.Strength, OLD.Mind, OLD.Dexterity,
                    OLD.Constitution, OLD.Perception, OLD.Spirit,
                    OLD.Ac, OLD.StrengthCap, OLD.MindCap,
                    OLD.DexterityCap, OLD.ConstitutionCap,
                    OLD.PerceptionCap, OLD.SpiritCap,
                    OLD.Hit, OLD.Dam, OLD.Hp, OLD.Hpr, OLD.Ma,
                    OLD.Mar, OLD.Mv, OLD.Mvr, OLD.Spelldam, OLD.Spellcrit,
                    OLD.ManaReduction, OLD.Mitigation, OLD.Accuracy,
                    OLD.Ammo, OLD.TwoHanded, OLD.MaxDam, OLD.AvgDam,
                    OLD.MinDam, OLD.Parry, OLD.Holdable, OLD.Rent,
                    OLD.Value, OLD.Weight, OLD.UniqueWear, OLD.Notes,
                    OLD.ModifiedBy, OLD.ModifiedOn, OLD.ModifiedByIP,
                    OLD.ModifiedByIPForward, OLD.AlignRestriction,
                    OLD.Quality, OLD.Bonded, OLD.Casts,
                    OLD.Level, OLD.NetStat, OLD.RangedAccuracy,
                    OLD.Concentration, OLD.MobId, OLD.QuestId,
                    OLD.WeaponType, OLD.SpeedFactor, OLD.WeaponType,
                    OLD.IsLight, OLD.IsHeroic, OLD.Soulbound, OLD.Deleted, OLD.IsLimited);

                INSERT INTO NotificationQueue (ActorId, ObjectId, ObjectType, ObjectPage, ObjectName, Verb, CreatedOn)
                SELECT M.Id, OLD.Id, 'item', 'items', OLD.Name, 'updated', NOW()
                FROM Members M
                    WHERE Username = NEW.ModifiedBy;
            END IF;
        END;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber + 1
        WHERE SortNumber >= 47;

        INSERT INTO ItemStatInfo (Display, Short, Var, Type, FilterString, DefaultValue, NetStat, ShowColumnDefault, Editable, CategoryId, SortNumber)
        VALUES ('Limited', 'Limited', 'isLimited', 'bool', '= 1', 'false', 0.00, 0, 1, 1, 47);

        -- Update 'Items' with "(Limited)" in the name to have the 'Limited' stat set to true
        UPDATE Items
        SET IsLimited = 1
        WHERE Name LIKE '%(limited)%';
    `;
}

exports.down = function() {
    return `
        -- Remove 'Limited' stat from 'Items'
        ALTER TABLE Items DROP COLUMN IsLimited;
        ALTER TABLE Items_AuditTrail DROP COLUMN IsLimited;

        DROP TRIGGER IF EXISTS Items_BEFORE_UPDATE;
        CREATE TRIGGER Items_BEFORE_UPDATE BEFORE UPDATE ON Items
        FOR EACH ROW BEGIN
            IF (@DISABLE_NOTIFICATIONS IS NULL AND NEW.Deleted = OLD.Deleted) THEN
                INSERT INTO Items_AuditTrail (ItemId, Name, Slot, Strength,
                    Mind, Dexterity, Constitution,
                    Perception, Spirit, Ac,
                    StrengthCap, MindCap, DexterityCap,
                    ConstitutionCap, PerceptionCap, SpiritCap,
                    Hit, Dam, Hp, Hpr, Ma, Mar, Mv, Mvr,
                    Spelldam, Spellcrit, ManaReduction,
                    Mitigation, Accuracy, Ammo, TwoHanded,
                    MaxDam, AvgDam, MinDam, Parry, Holdable,
                    Rent, Value, Weight, UniqueWear, Notes,
                    ModifiedBy, ModifiedOn, ModifiedByIP,
                    ModifiedByIPForward, AlignRestriction,
                    Quality, Bonded, Casts,
                    Level, NetStat, RangedAccuracy,
                    Concentration, MobId, QuestId,
                    WeaponType, SpeedFactor, WeaponStat,
                    IsLight, IsHeroic, Soulbound, Deleted)
                VALUES(OLD.Id, OLD.Name, OLD.Slot,
                    OLD.Strength, OLD.Mind, OLD.Dexterity,
                    OLD.Constitution, OLD.Perception, OLD.Spirit,
                    OLD.Ac, OLD.StrengthCap, OLD.MindCap,
                    OLD.DexterityCap, OLD.ConstitutionCap,
                    OLD.PerceptionCap, OLD.SpiritCap,
                    OLD.Hit, OLD.Dam, OLD.Hp, OLD.Hpr, OLD.Ma,
                    OLD.Mar, OLD.Mv, OLD.Mvr, OLD.Spelldam, OLD.Spellcrit,
                    OLD.ManaReduction, OLD.Mitigation, OLD.Accuracy,
                    OLD.Ammo, OLD.TwoHanded, OLD.MaxDam, OLD.AvgDam,
                    OLD.MinDam, OLD.Parry, OLD.Holdable, OLD.Rent,
                    OLD.Value, OLD.Weight, OLD.UniqueWear, OLD.Notes,
                    OLD.ModifiedBy, OLD.ModifiedOn, OLD.ModifiedByIP,
                    OLD.ModifiedByIPForward, OLD.AlignRestriction,
                    OLD.Quality, OLD.Bonded, OLD.Casts,
                    OLD.Level, OLD.NetStat, OLD.RangedAccuracy,
                    OLD.Concentration, OLD.MobId, OLD.QuestId,
                    OLD.WeaponType, OLD.SpeedFactor, OLD.WeaponType,
                    OLD.IsLight, OLD.IsHeroic, OLD.Soulbound, OLD.Deleted);

                INSERT INTO NotificationQueue (ActorId, ObjectId, ObjectType, ObjectPage, ObjectName, Verb, CreatedOn)
                SELECT M.Id, OLD.Id, 'item', 'items', OLD.Name, 'updated', NOW()
                FROM Members M
                    WHERE Username = NEW.ModifiedBy;
            END IF;
        END;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 1
        WHERE SortNumber >= 48;

        DELETE FROM ItemStatInfo
        WHERE Var = 'isLimited';
    `;
}
