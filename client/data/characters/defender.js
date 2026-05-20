const Defender = {
  class: "Defender",

  subclasses: [
    {
      subclass: "Protector",

      baseStats: {
        attack: 190,
        hp: 3019,
        defense: 147
      },

      skills: [
        {
          name: "Thorned Bulwark",
          type: "passive",
          trigger: "onBattleStart",
        
          effect: [
            {
              type: "buff",
              targetStat: "defense",
              value: 0.3
            },
            {
              type: "reflect",
              ratio: 0.1,
              scaleBy: "attack"
            }
          ]
        },

        {
          name: "Last Bastion",
          type: "passive",
          trigger: "onHpChange",

          effect: {
            type: "scalingBuff",
            targetStat: "defense",
            maxBonus: 0.25,
            condition: {
              hpThreshold: 0.4,
              direction: "decreasing"
            }
          }
        },

        {
          name: "Fortress of Purity",
          type: "ultimate",
          trigger: "onUltimate",

          effect: [
            {
              type: "buff",
              targetStat: "hp",
              value: 0.2,
              duration: 16
            },
            {
              type: "buff",
              targetStat: "defense",
              value: 0.15,
              duration: 16,
            },
            {
              type: "cleanse"
            },
            {
              type: "statusImmunity",
              target: "debuff",
              duration: 16,
            }
          ]
        }
      ]
    },

    {
      subclass: "Guardian",

      baseStats: {
        attack: 196,
        hp: 3191,
        defense: 135
      },

      skills: [
        {
          name: "Recovery Protocol",
          type: "passive",
          trigger: "onNoDamageTaken",

          condition: {
            duration: 9
          },

          effect: {
            type: "heal",
            value: 0.02,
            target: "maxHp"
          }
        },

        {
          name: "Penumbral Image",
          type: "passive",
          trigger: "onGameStart",
        
          condition: {
            interval: 20,
            maxStack: 3
          },
        
          effect: [
            {
              type: "reduceStatusDuration",
              status: "stagger",
              value: 1.4
            },
            {
              type: "buff",
              targetStat: "hp",
              value: 0.04,
              stackable: true
            },
            {
              type: "buff",
              targetStat: "defense",
              value: 0.025,
              stackable: true
            }
          ]
        },

        {
          name: "Myriad Grains",
          type: "ultimate",
          trigger: "onUltimate",

          effect: [
            {
              type: "buff",
              targetStat: "attack",
              value: 0.2,
              duration: 20
            },
            {
              type: "replaceAttackWithHeal",
              ratio: 0.9,
              duration: 20,
            },
            {
              type: "damageReduction",
              value: 0.15,
              duration: 20,
              tag: "sanctuary"
            }
          ]
        }
      ]
    }
  ]
};

export default Defender;