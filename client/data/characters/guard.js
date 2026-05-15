const Guard = {
  class: "Guard",

  subclasses: [
    {
      subclass: "Swordmaster",

      baseStats: {
        attack: 223,
        hp: 1982,
        defense: 98
      },

      skills: [
        {
          name: "Fractured Edge",
          type: "passive",
          trigger: "onAttack",

          chance: 0.4,

          effect: {
            type: "debuff",
            targetStat: "defense",
            value: 0.10,
            duration: 6,
            stackable: true,
            maxStack: 2
          }
        },

        {
          name: "Flow of Blades",
          type: "passive",
          trigger: "onCombo",

          effect: {
            type: "modifier",
            target: "comboMultiplier",
            value: 1.5
          }
        },

        {
          name: "Final Severance",
          type: "ultimate",
          trigger: "onUltimate",

          effect: {
            type: "nextAttackModifier",
          
            multiplier: 2.6,
            missingHpScaling: 0.35,
          
            consumeOnUse: true
          }
        }
      ]
    },

    {
      subclass: "Primal Guard",

      baseStats: {
        attack: 214,
        hp: 2049,
        defense: 107
      },

      skills: [
        {
          name: "Hunter’s Dominance",
          type: "passive",
          trigger: "onAttack",

          chance: 0.38,

          effect: {
            type: "statSwapDebuff",
            targetStats: {
              attack: 0.12,
              enemyAttack: -0.15
            },
            duration: 4
          }
        },

        {
          name: "Wild Evasion",
          type: "passive",
          trigger: "onIncomingAttack",

          chance: 0.25,

          effect: {
            type: "dodge"
          }
        },

        {
          name: "Blood Hound Ascension",
          type: "ultimate",
          trigger: "onUltimate",

          duration: "infinite",

          effect: [
            {
              type: "buff",
              targetStat: "hp",
              value: 0.3
            },
            {
              type: "buff",
              targetStat: "attack",
              value: 0.25
            },
            {
              type: "stateChange",
              target: "attackType",
              value: "true_damage"
            },
            {
              type: "passiveRule",
              rule: "minimumHpLock",
              value: 1
            },
            {
              type: "hpDrain",
              value: 0.04,
              interval: 1
            },
            {
              type: "deathDelay",
              condition: "hp == 1 && enemyAlive",
              delay: 15
            }
          ]
        }
      ]
    }
  ]
};

export default Guard;