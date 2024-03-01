exports.up = function() {
    return `
        -- Add 'Melee Crit Chance', 'Melee Crit Damage', and 'Damage Shield' stats to 'Items'
        ALTER TABLE Items ADD COLUMN Meleecritperc INT(11) DEFAULT NULL;
        ALTER TABLE Items_AuditTrail ADD COLUMN Meleecritperc INT(11) DEFAULT NULL;

        ALTER TABLE Items ADD COLUMN Meleecrit INT(11) DEFAULT NULL;
        ALTER TABLE Items_AuditTrail ADD COLUMN Meleecrit INT(11) DEFAULT NULL;

        ALTER TABLE Items ADD COLUMN Meleedamcap INT(11) DEFAULT NULL;
        ALTER TABLE Items_AuditTrail ADD COLUMN Meleedamcap INT(11) DEFAULT NULL;

        ALTER TABLE Items ADD COLUMN Damageshield INT(11) DEFAULT NULL;
        ALTER TABLE Items_AuditTrail ADD COLUMN Damageshield INT(11) DEFAULT NULL;

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
                    IsLight, IsHeroic, Soulbound, Deleted, IsLimited,
                    Meleecritperc, Meleecrit, Meleedamcap, Damageshield)
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
                    OLD.IsLight, OLD.IsHeroic, OLD.Soulbound, OLD.Deleted, OLD.IsLimited
                    OLD.Meleecritperc, OLD.Meleecrit, OLD.Meleedamcap, OLD.Damageshield);

                INSERT INTO NotificationQueue (ActorId, ObjectId, ObjectType, ObjectPage, ObjectName, Verb, CreatedOn)
                SELECT M.Id, OLD.Id, 'item', 'items', OLD.Name, 'updated', NOW()
                FROM Members M
                    WHERE Username = NEW.ModifiedBy;
            END IF;
        END;

        -- Add 'Melee Crit Chance', 'Melee Crit Damage', and 'Damage Shield' stats to 'ItemStatInfo'
        INSERT INTO ItemStatInfo (Display, Short, Var, Type, FilterString, DefaultValue, NetStat, ShowColumnDefault, Editable, CategoryId, SortNumber)
        VALUES ('Melee Crit Percentage', 'MeCritPerc', 'meleecritperc', 'int', '> 0', '0', 1, false, 1, 4, 402),
               ('Melee Crit', 'MeCrit', 'meleecrit', 'int', '> 0', '0', 1, false, 1, 4, 403),
               ('Melee Damage Cap', 'MeDamCap', 'meleedamcap', 'int', '> 0', '0', 2, false, 1, 4, 404),
               ('Damage Shield', 'DmgShield', 'damageshield', 'int', '> 0', '0', 3, false, 1, 6, 602);
    `;
}

exports.down = function() {
    return `
        ALTER TABLE Items DROP COLUMN Meleecritperc;
        ALTER TABLE Items_AuditTrail DROP COLUMN Meleecritperc;

        ALTER TABLE Items DROP COLUMN Meleecrit;
        ALTER TABLE Items_AuditTrail DROP COLUMN Meleecrit;

        ALTER TABLE Items DROP COLUMN Meleedamcap;
        ALTER TABLE Items_AuditTrail DROP COLUMN Meleedamcap;

        ALTER TABLE Items DROP COLUMN Damageshield;
        ALTER TABLE Items_AuditTrail DROP COLUMN Damageshield;

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

        DELETE FROM ItemStatInfo
        WHERE Var IN ('meleecritperc', 'meleecrit', 'meleedamcap', 'damageshield');
    `;
}
