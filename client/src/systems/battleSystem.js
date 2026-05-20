import { getCharKey } from "../utils/getCharKey.js";

export default class BattleSystem {
    constructor(scene) {
        this.scene = scene;

        this.tweens = scene.tweens;
        this.time = scene.time;

        this.playerHP = 0;
        this.playerMaxHP = 0;
        this.playerDefense = 0;
        this.playerAttack = 0;
        
        this.enemyHP = 0;
        this.enemyMaxHP = 0;
        this.enemyDefense = 0;
        this.enemyAttack = 0;

        this.timer = 50;
        this.timerDigits = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 5;
        this.comboMultiplierBonus = 1;

        this.isAnimating = false;
        this.isBattleOver = false;
    }

    setBattleObjects({ player, enemy, shadow, enemyShadow }) {
        this.player = player;
        this.enemy = enemy;
        this.shadow = shadow;
        this.enemyShadow = enemyShadow;
    }

    setCharacters(playerCharacter, enemyCharacter) {
        this.playerCharacter = playerCharacter;
        this.enemyCharacter = enemyCharacter;

        const pStats = this.playerCharacter.getBaseStats();
        const eStats = this.enemyCharacter.getBaseStats();

        this.playerHP = pStats.hp;
        this.playerMaxHP = pStats.hp;
        this.playerAttack = pStats.attack;
        this.playerDefense = pStats.defense;

        this.enemyHP = eStats.hp;
        this.enemyMaxHP = eStats.hp;
        this.enemyAttack = eStats.attack;
        this.enemyDefense = eStats.defense;

        this.playerCharacter._isStaggered = false;
        this.enemyCharacter._isStaggered = false;

        this.triggerOnBattleStartSkills(this.playerCharacter);
        this.triggerOnBattleStartSkills(this.enemyCharacter);

        this.triggerOnTimerSkills(this.playerCharacter);
        this.triggerOnTimerSkills(this.enemyCharacter);
    }

    setFinalTestSystem(system) {
        this.system = system;
    }

    setQuestionSystem(questionSystem) {
        this.questionSystem = questionSystem;
    }

    setUI({ playerName, enemyName, playerStatText, enemyStatText, comboText, ultimateButton, playerHpBarFill, enemyHpBarFill }) {
        this.playerStatText = playerStatText;
        this.enemyStatText = enemyStatText;
        this.comboText = comboText;
        this.ultimateButton = ultimateButton;
        this.playerName = playerName;
        this.enemyName = enemyName;
        this.playerHpBarFill = playerHpBarFill;
        this.enemyHpBarFill = enemyHpBarFill;
    
        this.updateUI();
        this.updateUltimateButton();
    }
    
    updateUI() {
        this.playerStatText.setText(
            `HP: ${this.playerHP} | ATK: ${this.playerAttack} | DEF: ${this.playerDefense}`
        );
    
        this.enemyStatText.setText(
            `HP: ${this.enemyHP} | ATK: ${this.enemyAttack} | DEF: ${this.enemyDefense}`
        );
        
        this.playerName.setText(this.playerCharacter.selectedSubclass)
        this.enemyName.setText(this.enemyCharacter.selectedSubclass)
        
        this.updateTimerUI();
        if (this.combo > 0) {
          this.comboText.setText(`Combo ${this.combo}x`);
          this.comboText.setVisible(true);
        } else {
          this.comboText.setVisible(false);
        }

        const playerHpPercent = this.playerHP / this.playerMaxHP;
        const enemyHpPercent = this.enemyHP / this.enemyMaxHP;
        this.hpBarBaseScaleX = 0.28;
        this.hpBarBaseScaleY = 0.27;

        if (this.playerHP <= 0) {
            this.playerHpBarFill.setScale(0, this.hpBarBaseScaleY);
        } else {
            this.playerHpBarFill.setScale(
                this.hpBarBaseScaleX * playerHpPercent,
                this.hpBarBaseScaleY
            );
        }
        
        if (this.enemyHP <= 0) {
            this.enemyHpBarFill.setScale(0, this.hpBarBaseScaleY);
        } else {
            this.enemyHpBarFill.setScale(
                this.hpBarBaseScaleX * enemyHpPercent,
                this.hpBarBaseScaleY
            );
        }
    }

    updateTimerUI() {
      this.timerDigits.forEach(d => d.destroy());
      this.timerDigits = [];
    
      const timerStr = this.timer.toString().padStart(2, '0'); 
    
      let startX = 715;
      const y = 170;
      const spacing = 38;
    
      for (let i = 0; i < timerStr.length; i++) {
        const digit = timerStr[i];
    
        const img = this.scene.add.image(
          startX + i * spacing,
          y,
          `num_${digit}`
        )
        .setScale(0.6)
        .setDepth(4004)
        .setScrollFactor(0);
    
        this.timerDigits.push(img);
      }
    }

    setTimerVisible(visible) {
        this.timerDigits.forEach(d => d.setVisible(visible));
    }

    getDamageMultiplier() {
        switch (this.combo) {
            case 1: return 1.0;
            case 2: return 1.1;
            case 3: return 1.3;
            case 4: return 1.5;
            case 5: return 1.7;
            default: return 1.0;
        }
    }

    startTimer() {
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.isBattleOver) return;

                this.timer--;
                this.updateUI();

                if (this.timer <= 0) {
                    this.handleTimeout();
                }
            }
        });
    }

    handleTimeout() {
        if (this.isBattleOver) return;

        let damage = 5;

        this.playerHP -= damage;
        this.enemyHP -= damage;

        this.combo = 0;
        this.comboMultiplierBonus = 1;
        this.updateUI();

        if (this.playerHP <= 0 || this.enemyHP <= 0) {
            this.endBattle(true);
            return;
        }

        if (this.questionSystem) {
            this.questionSystem.nextQuestion();
        }

        this.timer = 50;
        this.showDamageText(this.player, damage);
        this.showDamageText(this.enemy, damage);
        this.updateUI();
        this.updateUltimateButton();
    }

    onCorrectAnswer() {
        if (this.isBattleOver) return;

        this.triggerOnAttackSkills(this.playerCharacter, this.enemyCharacter);
        this.triggerOnComboSkills(this.playerCharacter);

        this.combo++;
        if (this.combo > this.maxCombo) {
            this.combo = this.maxCombo;
        }

        const multiplier = this.getDamageMultiplier();
        const finalMultiplier = this.comboMultiplierBonus 
        ? multiplier * this.comboMultiplierBonus 
        : multiplier;
        
        let adjustedMultiplier = finalMultiplier;
        let bonusMultiplier = 0;
        let bonusDamage = 0;

        if (this.nextAttackModifier) {
            const missingHp = this.enemyMaxHP - this.enemyHP;
            const missingRatio = missingHp / this.enemyMaxHP;
            
            adjustedMultiplier *= this.nextAttackModifier.multiplier;
            bonusMultiplier = missingRatio * this.nextAttackModifier.missingHpScaling;

            if (this.nextAttackModifier.consumeOnUse) {
                this.nextAttackModifier = null;
            }
        }

        this.isAttackDodged = false;
        this.triggerOnIncomingAttackSkills(this.enemyCharacter, this.playerCharacter);

        if (this.isAttackDodged) {
            this.showDodgeText(this.enemy);
            return;
        }

        let rawDamage = Math.round(this.playerAttack * adjustedMultiplier);
        let isTrueDamage = this.playerCharacter?._state?.attackType === "true_damage";
        
        bonusDamage = Math.round(this.playerAttack * bonusMultiplier);

        let damage = isTrueDamage
            ? rawDamage
            : Math.max(1, rawDamage - this.enemyDefense);

        damage += bonusDamage;

        if (this.enemyCharacter._damageReduction) {
            const reductions = Object.values(this.enemyCharacter._damageReduction);
            const totalReduction = reductions.reduce((sum, val) => sum + val, 0);
        
            damage = Math.round(damage * (1 - totalReduction));
        }

        if (this.playerCharacter._replaceAttackWithHeal) {
            const ratio = this.playerCharacter._replaceAttackWithHeal.ratio;
        
            const healAmount = Math.round(this.playerAttack * ratio);
        
            this.playerHP += healAmount;
            this.playerHP = Math.min(this.playerHP, this.playerMaxHP);
        
            this.showHealText(this.player, healAmount);
        } else {
            this.enemyHP -= damage;
        }

        this.triggerOnHpChangeSkills(this.enemyCharacter, "decreasing");
        this.triggerOnNoDamageTakenSkills(this.enemyCharacter);

        if (this.enemyCharacter._regenTimer) {
            this.enemyCharacter._regenTimer.remove(false);
            this.enemyCharacter._regenTimer = null;
        }

        if (this.enemyCharacter._reflect) {
            const ratio = this.enemyCharacter._reflect.ratio;
        
            const baseAttack = this.enemyAttack;
            const reflectDamage = Math.round(baseAttack * ratio);
        
            this.playerHP -= reflectDamage;
            this.showDamageText(this.player, reflectDamage);
        }

        const minHp = this.enemyCharacter?._rules?.minimumHpLock;

        if (minHp !== undefined) {
            this.enemyHP = Math.max(minHp, this.enemyHP);
        }

        this.showDamageText(this.enemy, damage);

        if (bonusDamage > 0) {
            this.showBonusDamageText(this.enemy, bonusDamage);
        }
        this.updateUI();
        const gainedScore = this.timer * 2;
        this.score += gainedScore;

        if (this.enemyHP <= 0) {
            if (!this.enemyCharacter._deathDelay?.active) {
                this.endBattle(true);
            }
            else if (this.scene.isMultiplayer && this.scene.socket) {
                this.scene.socket.emit("deathDelayActive", {
                    character: "enemy",
                    delay: this.enemyCharacter._deathDelayConfig?.delay
                });
            }
        }

        this.updateUltimateButton();
    }

    onWrongAnswer() {
        if (this.isBattleOver) return;

        this.triggerOnAttackSkills(this.enemyCharacter, this.playerCharacter);
        this.triggerOnComboSkills(this.enemyCharacter);

        this.isAttackDodged = false;
        this.triggerOnIncomingAttackSkills(this.playerCharacter, this.enemyCharacter);

        if (this.isAttackDodged) {
            this.showDodgeText(this.player);
            return;
        }

        let rawDamage = this.enemyAttack;

        let isTrueDamage = this.enemyCharacter?._state?.attackType === "true_damage";

        let damage = isTrueDamage
            ? rawDamage
            : Math.max(1, rawDamage - this.playerDefense);

        if (this.playerCharacter._damageReduction) {
            const reductions = Object.values(this.playerCharacter._damageReduction);
            const totalReduction = reductions.reduce((sum, val) => sum + val, 0);
        
            damage = Math.round(damage * (1 - totalReduction));
        }

        if (this.enemyCharacter._replaceAttackWithHeal) {
            const ratio = this.enemyCharacter._replaceAttackWithHeal.ratio;
        
            const healAmount = Math.round(this.enemyAttack * ratio);
        
            this.enemyHP += healAmount;
            this.enemyHP = Math.min(this.enemyHP, this.enemyMaxHP);
        
            this.showHealText(this.enemy, healAmount);
        } else {
            this.playerHP -= damage;
        }

        this.triggerOnHpChangeSkills(this.playerCharacter, "decreasing");
        this.triggerOnNoDamageTakenSkills(this.playerCharacter);
        this.triggerOnStartSkills(this.enemyCharacter, this.playerCharacter);

        if (this.playerCharacter._regenTimer) {
            this.playerCharacter._regenTimer.remove(false);
            this.playerCharacter._regenTimer = null;
        }

        if (this.playerCharacter._reflect) {
            const ratio = this.playerCharacter._reflect.ratio;
        
            const baseAttack = this.playerAttack;
            const reflectDamage = Math.round(baseAttack * ratio);
        
            this.enemyHP -= reflectDamage;
            this.showDamageText(this.enemy, reflectDamage);
        }

        const minHp = this.playerCharacter?._rules?.minimumHpLock;

        if (minHp !== undefined) {
            this.playerHP = Math.max(minHp, this.playerHP);
        }


        this.comboMultiplierBonus = 1;
        this.showDamageText(this.player, damage);

        const duration = this.questionSystem.applyStagger(6000, this.playerCharacter, this.enemyCharacter);

        const playerSkills = this.playerCharacter.getSkills();
        const hasSilenceUltimate = playerSkills.some(skill => {
            if (skill.type !== "ultimate") return false;
        
            const effects = Array.isArray(skill.effect)
                ? skill.effect
                : [skill.effect];
        
            return effects.some(e => e.type === "silence");
        });
        
        if (duration) {
            this.playerCharacter._isStaggered = true;
        
            this.scene.time.delayedCall(duration, () => {
                if (this.playerCharacter._isStaggered && hasSilenceUltimate && this.combo >= 3) {
                    this.combo = 0;
                    this.updateUltimateButton();
                }
                this.playerCharacter._isStaggered = false;
            });
        }

        
        if (this.playerCharacter._isStaggered && hasSilenceUltimate) {
            if (this.combo < 3) {
                this.combo = 0;
                this.updateUltimateButton();
            }
        } else {
            this.combo = 0;
        }
        
        this.player.anims.play(getCharKey(this.playerCharacter, "die"), true);
        this.time.delayedCall(duration, () => {
          this.player.anims.play(getCharKey(this.playerCharacter, "idle", "front"), true);
        });
        this.showStaggerText(duration);
        
        this.score -= 15;
        this.score = Math.max(0, this.score);

        if (this.playerHP <= 0) {
            if (!this.playerCharacter._deathDelay?.active) {
                this.endBattle(true);
            }
            // Jika deathDelay aktif, biarkan timer di deathDelayStart yang menyelesaikan battle.
            // Untuk multiplayer: broadcast sinyal deathDelay agar semua client menunggu.
            else if (this.scene.isMultiplayer && this.scene.socket) {
                this.scene.socket.emit("deathDelayActive", {
                    character: "player",
                    delay: this.playerCharacter._deathDelayConfig?.delay
                });
            }
        }
        this.updateUltimateButton();
    }

    // Taruh tepat setelah closing brace method onWrongAnswer()
    onWrongAnswerMultiplayer() {
        if (this.isBattleOver) return;

        const duration = this.questionSystem.applyStagger(6000, this.playerCharacter, this.enemyCharacter);

        if (duration) {
            this.playerCharacter._isStaggered = true;
            this.scene.time.delayedCall(duration, () => {
                this.playerCharacter._isStaggered = false;
            });

            this.time.delayedCall(200, () => {
                this.player.anims.play(getCharKey(this.playerCharacter, "die"), true);
                this.time.delayedCall(duration, () => {
                    this.player.anims.play(getCharKey(this.playerCharacter, "idle", "front"), true);
                });
            });
            this.showStaggerText(duration);
        }

        this.combo = 0;
        this.score -= 15;
        this.score = Math.max(0, this.score);
        this.updateUltimateButton();

        if (this.playerHP <= 0) {
            if (!this.playerCharacter._deathDelay?.active) {
                this.endBattle(true);
            }
            // Jika deathDelay aktif, biarkan timer di deathDelayStart yang menyelesaikan battle.
            // Broadcast ke semua client agar tidak langsung end di layar mereka.
            else if (this.scene.isMultiplayer && this.scene.socket) {
                this.scene.socket.emit("deathDelayActive", {
                    character: "player",
                    delay: this.playerCharacter._deathDelayConfig?.delay
                });
            }
        }
    }

    playerAttackTrigger() {
        if (this.isAnimating) return;
        this.isAnimating = true;

         this.playPlayerAttack(() => {
            this.isAnimating = false;
        });
        this.playEnemyHit();
    }

    enemyAttackTrigger() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.playEnemyAttack(() => {
            this.isAnimating = false;
        });
        this.playPlayerHit();
    }

    playPlayerAttack(onDone) {
        if (!this.player || !this.enemy) return;

        const originalX = this.player.x;
        this.player.anims.play(getCharKey(this.playerCharacter, "attack", "front"), true);
        this.player.once('animationcomplete', () => {
          this.player.anims.play(getCharKey(this.playerCharacter, "idle", "front"), true);
        });
        this.tweens.add({
            targets: this.player,
            x: this.enemy.x - 20,
            duration: 250,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                this.player.x = originalX;
                if (onDone) onDone();
            }
        });
    }

    playEnemyHit() {
        if (!this.enemy) return;

        const originalX = this.enemy.x;

        this.tweens.add({
            targets: this.enemy,
            x: this.enemy.x + 20,
            duration: 70,
            delay: 80,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                this.enemy.x = originalX;
            }
        });

        this.tweens.add({
            targets: this.enemy,
            alpha: 0.2,
            duration: 70,
            delay: 80,
            yoyo: true,
            repeat: 3
        });
    }

    playEnemyAttack(onDone) {
        if (!this.enemy || !this.player) return;

        const originalX = this.enemy.x;
        this.enemy.anims.play(getCharKey(this.enemyCharacter, "attack", "front"), true);
        this.enemy.once('animationcomplete', () => {
          this.enemy.anims.play(getCharKey(this.enemyCharacter, "idle", "front"), true);
        });
        this.tweens.add({
            targets: this.enemy,
            x: this.player.x + 20,
            duration: 250,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                this.enemy.x = originalX;
                if (onDone) onDone();
            }
        });
    }

    playPlayerHit() {
        if (!this.player) return;

        const originalX = this.player.x;

        this.tweens.add({
            targets: this.player,
            x: this.player.x - 20,
            duration: 70,
            delay: 80,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                this.player.x = originalX;
            }
        });

        this.tweens.add({
            targets: this.player,
            alpha: 0.2,
            duration: 70,
            delay: 80,
            yoyo: true,
            repeat: 3
        });
    }

   showStaggerText(duration = 6000) {
        if (!this.player) return;

        if (this.staggerText) {
            this.staggerText.destroy();
        }

        this.staggerText = this.scene.add.text(
            this.player.x,
            this.player.y - 60,
            'STAGGERED',
            {
                fontSize: '16px',
                fill: '#ad1010',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(5000);

        this.scene.time.delayedCall(duration, () => {
            if (this.staggerText) {
                this.staggerText.destroy();
                this.staggerText = null;
            }
        });
    }

    showDamageText(target, damage) {
        if (!target) return;

        const dmgText = this.scene.add.text(
            target.x,
            target.y - 55,
            `-${damage}`,
            {
                fontSize: '16px',
                fill: '#ff0000',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(5000);

        this.tweens.add({
            targets: dmgText,
            y: dmgText.y - 10,
            alpha: 0,
            duration: 2000,
            ease: 'Power1',
            onComplete: () => {
                dmgText.destroy();
            }
        });
    }

        showHealText(target, healAmount) {
        if (!target) return;

        const healText = this.scene.add.text(
            target.x,
            target.y - 55,
            `-${healAmount}`,
            {
                fontSize: '16px',
                fill: '#77ff00',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(5000);

        this.tweens.add({
            targets: healText,
            y: healText.y - 10,
            alpha: 0,
            duration: 2000,
            ease: 'Power1',
            onComplete: () => {
                healText.destroy();
            }
        });
    }

    showBonusDamageText(target, damage) {
        if (!target) return;

        const bonusText = this.scene.add.text(
            target.x + 40,
            target.y - 65,
            `-${damage}`,
            {
                fontSize: '14px',
                fill: '#ff0000',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(5000);

        this.tweens.add({
            targets: bonusText,
            y: bonusText.y - 10,
            alpha: 0,
            duration: 2000,
            ease: 'Power1',
            onComplete: () => {
                bonusText.destroy();
            }
        });
    }

    showDodgeText(target) {
        if (!target) return;
    
        const text = this.scene.add.text(
            target.x,
            target.y - 60,
            'DODGE',
            {
                fontSize: '16px',
                fill: '#f2f2f2',
                fontStyle: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(5000);
    
        this.tweens.add({
            targets: text,
            y: text.y - 10,
            alpha: 0,
            duration: 2000,
            ease: 'Power1',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    triggerOnAttackSkills(attackerChar, defenderChar) {
        if (!attackerChar || !defenderChar) return;

        const silence = attackerChar._silence;
    
        if (silence?.blockSkills) return;

        const skills = attackerChar.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onAttack") return;

            if (skill.chance !== undefined && Math.random() > skill.chance) return;

            this.applyEffect(skill.effect, attackerChar, defenderChar);
        });
    }

    triggerOnIncomingAttackSkills(defenderChar, attackerChar) {
        if (!defenderChar || !attackerChar) return;

        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = defenderChar.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onIncomingAttack") return;

            if (skill.chance !== undefined && Math.random() > skill.chance) return;

            this.applyEffect(skill.effect, attackerChar, defenderChar);
        });
    }

    triggerOnComboSkills(character) {
        if (!character) return;

        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = character.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onCombo") return;

            this.applyEffect(skill.effect, character, null);
        });
    }

    triggerOnBattleStartSkills(character) {
        if (!character) return;

        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = character.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onBattleStart") return;

            this.applyEffect(skill.effect, character, null);
        });
    }

    triggerOnHpChangeSkills(character, direction) {
        if (!character) return;

        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = character.getSkills();
    
        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onHpChange") return;
        
            this.applyEffect(skill.effect, character, null, direction);
        });
    }

    triggerOnNoDamageTakenSkills(character) {
        if (!character) return;

        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = character.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onNoDamageTaken") return;

            const duration = skill.condition?.duration;
            if (!duration) return;

            if (character._noDamageTimer) {
                character._noDamageTimer.remove(false);
            }

            if (character._regenTimer) {
                character._regenTimer.remove(false);
                character._regenTimer = null;
            }

            character._noDamageTimer = this.scene.time.delayedCall(duration * 1000, () => {
                character._regenTimer = this.scene.time.addEvent({
                    delay: 1000,
                    loop: true,
                    callback: () => {
                        this.applyEffect(skill.effect, character, null);
                    }
                });

            });
        });
    }

    triggerOnTimerSkills(character) {
        if (!character) return;
        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = character.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onGameStart") return;

            const interval = skill.condition?.interval;
            const maxStack = skill.condition?.maxStack;
            
            if (!interval || !maxStack) return;

            if (!character._timerSkillState) {
                character._timerSkillState = {};
            }

            character._timerSkillState[skill.name] = {
                stack: 0
            };

            skill.effect.forEach(effect => {
                if (effect.type === "reduceStatusDuration") {
                    this.applyEffect(effect, character, null);
                }
            });

            this.scene.time.addEvent({
                delay: interval * 1000,
                loop: true,
                callback: () => {
                    const state = character._timerSkillState[skill.name];

                    if (state.stack >= maxStack) return;

                    skill.effect.forEach(effect => {
                        if (effect.type !== "buff") return;
                        this.applyEffect(effect, character, null);
                    });

                    state.stack++;
                }
            });
        });
    }

    triggerOnStartSkills(defenderChar, attackerChar) {
        if (!defenderChar || !attackerChar) return;

        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const skills = defenderChar.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "passive") return;
            if (skill.trigger !== "onStart") return;

            this.applyEffect(skill.effect, defenderChar, attackerChar);
        });
    }

    triggerOnUltimateSkills(character) {
        if (!character) return;

        const skills = character.getSkills();

        skills.forEach(skill => {
            if (skill.type !== "ultimate") return;
            if (skill.trigger !== "onUltimate") return;

            this.applyEffect(skill.effect, character, null);
        });
    }

    activateUltimate() {
        const silence = this.playerCharacter._silence;
    
        if (silence?.blockSkills) return;

        const playerSkills = this.playerCharacter.getSkills();
        const hasSilenceUltimate = playerSkills.some(skill => {
            if (skill.type !== "ultimate") return false;
        
            const effects = Array.isArray(skill.effect)
                ? skill.effect
                : [skill.effect];
        
            return effects.some(e => e.type === "silence");
        });

        if (this.playerCharacter._isStaggered && hasSilenceUltimate) {
            this.combo = 0;
            this.showStaggerText(null);
        }
    
        this.triggerOnUltimateSkills(this.playerCharacter);
    
        this.isUltimateUsed = true;
    
        this.updateUltimateButton();
    }

    updateUltimateButton() {
        if (!this.ultimateButton) return;

        const isStaggered = this.playerCharacter?._isStaggered;

        let canUse;

        if (isStaggered && this.combo >= 3 && !this.isUltimateUsed) {
            canUse = true;
        } else {
            canUse = (this.combo >= 3 && !this.isUltimateUsed);
        }

        this.ultimateButton.setAlpha(canUse ? 1 : 0.5);

        if (canUse) {
            this.ultimateButton.setInteractive({ useHandCursor: true });
        } else {
            this.ultimateButton.disableInteractive();
        }
    }

    applyEffect(effect, attackerChar, defenderChar) {
        if (!effect) return;

        if (Array.isArray(effect)) {
            effect.forEach(e => {
                this.applyEffect(e, attackerChar, defenderChar);
            });
            return;
        }

        if (effect.type === "buff") {
            const { targetStat, value, duration } = effect;
        
            const baseStats = attackerChar.getBaseStats();
            const increase = Math.round(baseStats[targetStat] * value);
        
            const isPlayer = attackerChar === this.playerCharacter;
        
            const statKey = isPlayer ? "player" : "enemy";
        
            if (targetStat === "hp") {
                this[`${statKey}MaxHP`] += increase;
                this[`${statKey}HP`] += increase;
            } else {
                this[`${statKey}${capitalize(targetStat)}`] += increase;
            }
        
            if (!duration || duration === "infinite") {
                return;
            }
        
            this.scene.time.delayedCall(duration * 1000, () => {
                if (targetStat === "hp") {
                    this[`${statKey}MaxHP`] -= increase;
                    this[`${statKey}HP`] = Math.min(
                        this[`${statKey}HP`],
                        this[`${statKey}MaxHP`]
                    );
                } else {
                    this[`${statKey}${capitalize(targetStat)}`] -= increase;
                }
            });
        }

        if (effect.type === "debuff") {
            if (defenderChar?._immunity?.debuff) return;

            const { targetStat, value, maxStack, duration } = effect;

            if (!defenderChar._debuffs) {
                defenderChar._debuffs = {};
            }

            if (!defenderChar._debuffs[targetStat]) {
                defenderChar._debuffs[targetStat] = {
                    stack: 0,
                    reductionPerStack: 0,
                    timer: null
                };
            }

            const debuff = defenderChar._debuffs[targetStat];

            const baseStats = defenderChar.getBaseStats();
            const reductionAmount = Math.round(baseStats[targetStat] * value);

            if (!maxStack || debuff.stack < maxStack) {
                debuff.stack++;

                debuff.reductionPerStack = reductionAmount;

                if (defenderChar === this.enemyCharacter) {
                    this[`enemy${capitalize(targetStat)}`] -= reductionAmount;
                } else {
                    this[`player${capitalize(targetStat)}`] -= reductionAmount;
                }
            }

            if (debuff.timer) {
                debuff.timer.remove(false);
            }

            if (duration) {
                debuff.timer = this.scene.time.delayedCall(duration * 1000, () => {
                    const totalRestore = debuff.stack * debuff.reductionPerStack;

                    if (defenderChar === this.enemyCharacter) {
                        this[`enemy${capitalize(targetStat)}`] += totalRestore;
                    } else {
                        this[`player${capitalize(targetStat)}`] += totalRestore;
                    }

                    defenderChar._debuffs[targetStat] = null;
                });
            }
        }

        if (effect.type === "modifier") {
            const { target, value } = effect;

            if (target === "comboMultiplier") {
                this.comboMultiplierBonus = value;
            }
        }


        if (effect.type === "nextAttackModifier") {
            this.nextAttackModifier = {
                multiplier: effect.multiplier,
                missingHpScaling: effect.missingHpScaling,
                consumeOnUse: effect.consumeOnUse
            };
        }

        if (effect.type === "statSwapDebuff") {
            const { targetStats, duration } = effect;
        
            if (!attackerChar || !defenderChar) return;
        
            if (!attackerChar._statSwapDebuff) {
                attackerChar._statSwapDebuff = {
                    attackerChanges: {},
                    defenderChanges: {},
                    timer: null
                };
            }
        
            const debuffData = attackerChar._statSwapDebuff;
        
            const attackerBase = attackerChar.getBaseStats();
            const defenderBase = defenderChar.getBaseStats();
        
            Object.keys(debuffData.attackerChanges).forEach(stat => {
                this[`player${capitalize(stat)}`] -= debuffData.attackerChanges[stat];
            });
        
            Object.keys(debuffData.defenderChanges).forEach(stat => {
                this[`enemy${capitalize(stat)}`] -= debuffData.defenderChanges[stat];
            });
        
            debuffData.attackerChanges = {};
            debuffData.defenderChanges = {};
        
            if (debuffData.timer) {
                debuffData.timer.remove(false);
                debuffData.timer = null;
            }
        
            Object.keys(targetStats).forEach(stat => {
                const value = targetStats[stat];
            
                if (stat === "attack" || stat === "defense" || stat === "hp") {
                    const change = Math.round(attackerBase[stat] * value);
                
                    this[`player${capitalize(stat)}`] += change;
                    debuffData.attackerChanges[stat] = change;
                }
            
                if (stat.startsWith("enemy")) {
                    const pureStat = stat.replace("enemy", "").toLowerCase();
                
                    const change = Math.round(defenderBase[pureStat] * value);
                
                    this[`enemy${capitalize(pureStat)}`] += change;
                    debuffData.defenderChanges[pureStat] = change;
                }
            });
        
            if (duration) {
                debuffData.timer = this.scene.time.delayedCall(duration * 1000, () => {
                    Object.keys(debuffData.attackerChanges).forEach(stat => {
                        this[`player${capitalize(stat)}`] -= debuffData.attackerChanges[stat];
                    });
                
                    Object.keys(debuffData.defenderChanges).forEach(stat => {
                        this[`enemy${capitalize(stat)}`] -= debuffData.defenderChanges[stat];
                    });
                
                    attackerChar._statSwapDebuff = null;
                });
            }
        }

        if (effect.type === "dodge") {
            this.isAttackDodged = true;
        }

        if (effect.type === "stateChange") {
            const { target, value } = effect;

            if (!attackerChar._state) attackerChar._state = {};

            attackerChar._state[target] = value;
        }

        if (effect.type === "passiveRule") {
            const { rule, value } = effect;

            if (!attackerChar._rules) attackerChar._rules = {};

            attackerChar._rules[rule] = value;
        }

        if (effect.type === "hpDrain") {
            const { value, interval } = effect;
        
            if (!attackerChar._hpDrain) {
                attackerChar._hpDrain = {};
            }
        
            if (attackerChar._hpDrain.timer) {
                attackerChar._hpDrain.timer.remove(false);
            }
        
            if (attackerChar._hpDrain.boostTimer) {
                attackerChar._hpDrain.boostTimer.remove(false);
            }
        
            attackerChar._hpDrain.currentValue = value;
        
            attackerChar._hpDrain.timer = this.scene.time.addEvent({
                delay: interval * 1000,
                loop: true,
                callback: () => {
                    const baseStats = attackerChar.getBaseStats();
                    const drainAmount = Math.round(baseStats.hp * attackerChar._hpDrain.currentValue);
                
                    if (attackerChar === this.playerCharacter) {
                        this.playerHP -= drainAmount;

                        const minHp = this.playerCharacter?._rules?.minimumHpLock;

                        if (minHp !== undefined) {
                            this.playerHP = Math.max(minHp, this.playerHP);
                        
                            const config = this.playerCharacter._deathDelayConfig;

                            if (this.playerHP === minHp && config && !this.playerCharacter._deathDelay) {
                                this.applyEffect({
                                    type: "deathDelayStart"
                                }, this.playerCharacter, null);
                            }
                        }
                    } else {
                        this.enemyHP -= drainAmount;

                        const minHp = this.enemyCharacter?._rules?.minimumHpLock;

                        if (minHp !== undefined) {
                            this.enemyHP = Math.max(minHp, this.enemyHP);
                        
                            const config = this.enemyCharacter._deathDelayConfig;

                            if (this.enemyHP === minHp && config && !this.enemyCharacter._deathDelay) {
                                this.applyEffect({
                                    type: "deathDelayStart"
                                }, this.enemyCharacter, null);
                            }
                        }
                    }
                
                    this.updateUI();
                    if (this.scene.isMultiplayer && this.scene.socket) {
                        this.scene.broadcastHpSync();
                    }
                }
            });
        
            attackerChar._hpDrain.boostTimer = this.scene.time.delayedCall(12000, () => {
                attackerChar._hpDrain.currentValue *= 2;
            });
        }

        if (effect.type === "deathDelay") {
            if (!attackerChar._deathDelayConfig) {
                attackerChar._deathDelayConfig = {
                    delay: effect.delay
                };
            }
        }

        if (effect.type === "deathDelayStart") {
            const config = attackerChar._deathDelayConfig;
            if (!config) return;
                
            attackerChar._deathDelay = {
                active: true
            };
        
            attackerChar._deathDelay.timer = this.scene.time.delayedCall(config.delay * 1000, () => {
                attackerChar._deathDelay.active = false;
            
                if (attackerChar === this.playerCharacter) {
                    this.playerHP = 0;
                    // Broadcast ke semua client bahwa death delay selesai, baru end battle
                    if (this.scene.isMultiplayer && this.scene.socket) {
                        this.scene.socket.emit("deathDelayEnd", { character: "player" });
                    }
                    this.endBattle(true);
                } else {
                    this.enemyHP = 0;
                    // Broadcast ke semua client bahwa death delay selesai, baru end battle
                    if (this.scene.isMultiplayer && this.scene.socket) {
                        this.scene.socket.emit("deathDelayEnd", { character: "enemy" });
                    }
                    this.endBattle(true);
                }
            });
        }

        if (effect.type === "reflect") {
            if (!attackerChar._reflect) {
                attackerChar._reflect = {};
            }
        
            attackerChar._reflect.ratio = effect.ratio;
            attackerChar._reflect.scaleBy = effect.scaleBy;
        }

        if (effect.type === "scalingBuff") {
            const { targetStat, maxBonus, condition } = effect;
        
            const isPlayer = attackerChar === this.playerCharacter;
        
            const currentHP = isPlayer ? this.playerHP : this.enemyHP;
            const maxHP = isPlayer ? this.playerMaxHP : this.enemyMaxHP;
        
            const hpRatio = currentHP / maxHP;
        
            if (condition.direction === "decreasing" && hpRatio > condition.hpThreshold) return;
        
            const baseStats = attackerChar.getBaseStats();
        
            const missingRatio = 1 - hpRatio;
        
            const scaledBonus = Math.min(maxBonus, missingRatio * maxBonus);
        
            const newValue = Math.round(baseStats[targetStat] * scaledBonus);
        
            if (!attackerChar._scalingBuff) {
                attackerChar._scalingBuff = {};
            }
        
            const prevValue = attackerChar._scalingBuff[targetStat] || 0;
        
            const diff = newValue - prevValue;
        
            if (diff !== 0) {
                if (isPlayer) {
                    this[`player${capitalize(targetStat)}`] += diff;
                } else {
                    this[`enemy${capitalize(targetStat)}`] += diff;
                }
            
                attackerChar._scalingBuff[targetStat] = newValue;
            }
        }

        if (effect.type === "cleanse") {
            const targetChar = attackerChar;
        
            if (targetChar._debuffs) {
                Object.keys(targetChar._debuffs).forEach(stat => {
                    const debuff = targetChar._debuffs[stat];
                    if (!debuff) return;
                
                    const totalRestore = debuff.stack * debuff.reductionPerStack;
                
                    if (targetChar === this.enemyCharacter) {
                        this[`enemy${capitalize(stat)}`] += totalRestore;
                    } else {
                        this[`player${capitalize(stat)}`] += totalRestore;
                    }
                
                    if (debuff.timer) {
                        debuff.timer.remove(false);
                    }
                });
            
                targetChar._debuffs = {};
            }
        
            if (targetChar._negativeEffects) {
                Object.keys(targetChar._negativeEffects).forEach(key => {
                    if (key === "stagger") return;
                
                    const effect = targetChar._negativeEffects[key];
                    if (effect?.timer) {
                        effect.timer.remove(false);
                    }
                });
            
                targetChar._negativeEffects = {};
            }

            if (targetChar._dotEffects) {
                Object.keys(targetChar._dotEffects).forEach(key => {
                    const effect = targetChar._dotEffects[key];
                    if (!effect) return;
                
                    if (effect.timer) {
                        effect.timer.remove(false);
                    }
                });
            
                targetChar._dotEffects = {};
            }
        }

        if (effect.type === "statusImmunity") {
            const targetChar = attackerChar;
        
            if (!targetChar._immunity) {
                targetChar._immunity = {};
            }
        
            targetChar._immunity[effect.target] = true;
        
            if (effect.duration && effect.duration !== "infinite") {
                this.scene.time.delayedCall(effect.duration * 1000, () => {
                    targetChar._immunity[effect.target] = false;
                });
            }
        }

        if (effect.type === "heal") {
            const { value, target } = effect;
        
            const isPlayer = attackerChar === this.playerCharacter;
            const statKey = isPlayer ? "player" : "enemy";
        
            let healAmount = 0;
        
            if (target === "maxHp") {
                healAmount = Math.max(1, Math.floor(this[`${statKey}MaxHP`] * value));
            }
        
            this[`${statKey}HP`] += healAmount;
        
            this[`${statKey}HP`] = Math.min(
                this[`${statKey}HP`],
                this[`${statKey}MaxHP`]
            );
        }

        if (effect.type === "reduceStatusDuration") {
            const targetChar = attackerChar;
        
            if (!targetChar._statusModifiers) {
                targetChar._statusModifiers = {};
            }
        
            targetChar._statusModifiers[effect.status] = effect.value;
        }

        if (effect.type === "modifyStatusDuration") {
            const targetChar = defenderChar;
        
            if (!targetChar._staggerModifiers) {
                targetChar._staggerModifiers = {};
            }
        
            targetChar._staggerModifiers[effect.status] = effect.value;
        }

        if (effect.type === "damageReduction") {
            const { value, duration, tag } = effect;
        
            if (!attackerChar._damageReduction) {
                attackerChar._damageReduction = {};
            }
        
            attackerChar._damageReduction[tag || "default"] = value;
        
            if (duration) {
                this.scene.time.delayedCall(duration * 1000, () => {
                    if (attackerChar._damageReduction) {
                        delete attackerChar._damageReduction[tag || "default"];
                    }
                });
            }
        }

        if (effect.type === "replaceAttackWithHeal") {
            const { ratio, duration } = effect;
        
            attackerChar._replaceAttackWithHeal = {
                ratio: ratio
            };
        
            if (duration) {
                this.scene.time.delayedCall(duration * 1000, () => {
                    attackerChar._replaceAttackWithHeal = null;
                });
            }
        }

        if (effect.type === "dot") {
            if (defenderChar?._immunity?.debuff) return;

            const { value, targetStat, duration } = effect;
        
            const baseStats = attackerChar.getBaseStats();

            const finalDamage = Math.round(baseStats[targetStat] * value);
            let appliedDamage = finalDamage;
        
            if (!defenderChar._dotEffects) {
                defenderChar._dotEffects = {};
            }
        
            if (defenderChar._dotEffects.poison) {
                const existing = defenderChar._dotEffects.poison;
            
                existing.duration = duration;

                if (defenderChar._silence) {
                    appliedDamage = Math.round(baseStats[targetStat] * 0.6);
                }

                existing.damage = appliedDamage;

                if (existing.timer) {
                    existing.timer.remove(false);
                }
            }
        
            const dotData = {
                type: "poison",
                damage: appliedDamage,
                duration: duration,
                elapsed: 0,
                timer: null
            };
        
            dotData.timer = this.scene.time.addEvent({
                delay: 1000,
                repeat: duration - 1,
                callback: () => {
                    let target;
                    if (defenderChar === this.enemyCharacter) {
                        this.enemyHP -= dotData.damage;
                        target = this.enemy;

                        if (this.enemyHP <= 0) {
                                this.endBattle(true);
                        }
                    } else {
                        this.playerHP -= dotData.damage;
                        target = this.player;
                        if (this.playerHP <= 0) {
                                this.endBattle(true);
                        }
                    }
                
                    this.showDamageText(target, dotData.damage);
                    this.updateUI();
                    if (this.scene.isMultiplayer && this.scene.socket) {
                        this.scene.broadcastHpSync();
                    }
                }
            });
        
            defenderChar._dotEffects.poison = dotData;
        }

        if (effect.type === "cleanseSelfStatus") {
            if (!attackerChar) return;
        
            if (effect.targetStatus === "stagger") {
                attackerChar._isStaggered = false;
                this.questionSystem.isStaggered = false;
            }
        }

        if (effect.type === "silence") {
            if (!attackerChar) return;
        
            const isPlayer = attackerChar === this.playerCharacter;
            const targetChar = isPlayer ? this.enemyCharacter : this.playerCharacter;
            const targetCharSkills = targetChar.getSkills();
        
            let blockSkills;
        
            if (!this.isUltimateUsed) {
                blockSkills = targetCharSkills.filter(skill => skill.type === "ultimate");
            } else {
                blockSkills = targetCharSkills.filter(skill => skill.type === "passive");
            }
        
            targetChar._silence = {
                blockSkills: blockSkills,
                duration: effect.duration
            };

            this.scene.time.delayedCall(effect.duration * 1000, () => {
                targetChar._silence = null;
            });
        }
    }

    getStarByScore(score) {
        if (score >= 250) return 1;
        if (score >= 150) return 2;
        if (score > 0) return 3;
        return 4;
    }

    showResult(isWin) {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        const bgKey = isWin ? 'win_bg' : 'lose_bg';
        const headerKey = isWin ? 'win_header' : 'lose_header';
        const tableKey = isWin ? 'win_table' : 'lose_table';

        let starLevel;

        if (!isWin) {
            starLevel = 4;
        } else {
            starLevel = this.getStarByScore(this.score);
        }

        const starKey = isWin
            ? `win_star_${starLevel}`
            : `lose_star_${starLevel}`;

        this.resultOverlay = this.scene.add.rectangle(0,0,this.scene.scale.width,this.scene.scale.height,0x000000,0.6)
            .setOrigin(0)
            .setDepth(4999)
            .setScrollFactor(0);

        this.scene.add.image(centerX, centerY, bgKey)
            .setScale(0.3)
            .setOrigin(0.5)
            .setDepth(5000)
            .setScrollFactor(0);
        
        this.scene.add.image(centerX, centerY - 170, headerKey)
            .setScale(0.3)
            .setOrigin(0.5)
            .setDepth(5001)
            .setScrollFactor(0);

        this.scene.add.image(centerX, centerY + 10, tableKey)
            .setScale(0.3)
            .setOrigin(0.5)
            .setDepth(5000)
            .setScrollFactor(0);

        const scoreText = this.scene.add.text(centerX, centerY - 10, `${this.score}`, {
            fontSize: '48px',
            color: '#101010',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setDepth(5002)
        .setScrollFactor(0);

        this.scene.add.image(centerX, centerY - 80, starKey)
            .setScale(0.2)
            .setOrigin(0.5)
            .setDepth(5002)
            .setScrollFactor(0);
        
        this.scene.add.image(centerX, centerY + 170, "btnClose2")
            .setScale(0.3)
            .setOrigin(0.5)
            .setDepth(5002)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {this.system.endBattle(isWin)});
    }
    

    endBattle(isWin) {
        if (this.isBattleOver) return;
        
        this.isBattleOver = true;
        const scene = this.scene;
        
        const highScore = localStorage.getItem('highScore') || 0;
        
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
        }

        if (scene.finalMusic) {
            scene.tweens.add({
                targets: scene.finalMusic,
                volume: 0,
                duration: 1000,
                ease: "Linear",
                onComplete: () => {
                    scene.finalMusic.stop();
                    this.showResult(isWin);
                }
            });
        } else {
            this.showResult(isWin);
        }
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}