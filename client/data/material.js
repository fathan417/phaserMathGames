const materials = {
  statue1: [
  // ================= Slide 1 =================
    {
      title: "Apa itu Peluang?",
      content: [
        "Peluang itu bilang 'bisa atau nggak bisa'.",
        "Misal: koin. Kalau dilempar, bisa muncul angka atau gambar."
      ],
      interaction: {
        type: "click",
        action: "createCoin",
        description: "Klik koin untuk melihat angka atau gambar muncul"
      }
    },

  // ================= Slide 2 =================
    {
      title: "Nilai Peluang",
      content: [
        "Peluang selalu antara 0 sampai 1.",
        "0 = mustahil, 1 = pasti.",
        "Peluang bisa dinyatakan sebagai pecahan, desimal, atau persen."
      ],
      interaction: {
        type: "slider",
        action: "createSlider",
        description: "Geser slider untuk lihat nilai peluang berubah"
      }
    },

  // ================= Slide 3 =================
    {
      title: "Mini Quiz",
      content: [
        "Dadu dilempar sekali. Berapa peluang muncul angka 5?"
      ],
      interaction: {
        type: "clickOption",
        options: ["1/6", "1/5", "1/4", "1/3"],
        correct: "1/6",
        feedback: {
          correct: "Benar! Ada 1 dari 6 sisi dadu.",
          wrong: "Salah, coba ingat dadu ada 6 sisi."
        }
      }
    },

  // ================= Slide 4 =================
    {
      title: "Ringkasan Peluang",
      content: [
        "Peluang = 0 (mustahil) sampai 1 (pasti).",
        "Coba selalu lihat objek nyata: koin atau dadu."
      ],
      interaction: null
    }
  ],

  statue2: [
    // ================= Slide 1 =================
    {
      title: "Ruang Sampel",
      content: [
        "Ruang sampel adalah semua kemungkinan yang bisa terjadi.",
        "Biasanya ditulis dengan S.",
        "Contoh: lempar koin → {angka, gambar}"
      ],
      interaction: {
        type: "button",
        action: "showCoinSet",
        button: [
          {
          label: "Lihat Kemungkinan"}
        ],
        description: "Tekan tombol untuk melihat semua kemungkinan hasil koin"
      }
    },

    // ================= Slide 2 =================
    {
      title: "Contoh Ruang Sampel",
      content: [
        "Kalau dadu dilempar, apa saja kemungkinan yang muncul?",
        "Semua hasilnya adalah: {1, 2, 3, 4, 5, 6}",
        "Itulah ruang sampel dari dadu."
      ],
      interaction: {
        type: "button",
        action: "showDiceFaces",
        button: [
          {
            label: "Lihat Kemungkinan"
          }
        ],
        description: "Tekan tombol untuk melihat semua kemungkinan angka dadu"
      }
    },

    // ================= Slide 3 =================
    {
      title: "Apa itu Kejadian?",
      content: [
        "Kejadian adalah bagian dari ruang sampel.",
        "Biasanya ditulis dengan A.",
        "Artinya kita hanya memilih beberapa hasil dari semua kemungkinan."
      ],
      interaction: {
        type: "button",
        mode: "choice",
        action: "showEventDice",
        description: "Pilih salah satu untuk melihat contoh kejadian dari dadu",
        button: [
          { label: "Ganjil", value: "ganjil" },
          { label: "Genap", value: "genap" }
        ],
        feedback: {
          ganjil: "Ada 3 kejadian untuk angka ganjil dari 6 kemungkinan",
          genap: "Ada 3 kejadian untuk angka genap dari 6 kemungkinan"
        }
      }
    },

    // ================= Slide 4 =================
    {
      title: "Mini Quiz",
      content: [
        "Dalam sebuah kotak terdapat bola merah, biru, dan hijau.",
        "Jika satu bola tersebut di ambil, manakah ruang sampel yang benar?"
      ],
      interaction: {
        type: "clickOption",
        options: [
          "S = {merah, biru, hijau}",
          "S = {merah, biru}",
          "S = {kuning}",
          "S = {biru, hijau}"
        ],
        correct: "S = {merah, biru, hijau}",
        feedback: {
          correct: "Benar! Ruang sampel harus memuat semua kemungkinan hasil.",
          wrong: "Coba lagi. Ruang sampel harus mencakup semua kemungkinan hasil."
        }
      }
    },

    // ================= Slide 5 =================
    {
      title: "Ruang Sampel vs Kejadian",
      content: [
        "Ruang sampel = semua kemungkinan.",
        "Kejadian = hasil dari kemungkinan itu.",
        "Jadi ingat! kejadian selalu berada di dalam ruang sampel."
      ],
      interaction: null
    }

  ],

  statue3: [
    // ================= Slide 1 =================
    {
      title: "Eksperimen Peluang",
      content: [
        "Seret kartu dari dalam kotak.",
        "Perhatikan warna yang kamu dapatkan.",
        "Ubah jumlah kartu untuk melihat bagaimana peluang berubah."
      ],
      interaction: {
        type: "hybrid", 
        action: "cardProbabilityLab",
        description: "Drag kartu dari kotak & gunakan slider untuk mengubah komposisi warna"
      }
    },

    // ================= Slide 2 =================
    {
      title: "Rumus Peluang",
      content: [
        "Peluang ditulis sebagai P(A)",
        "Rumusnya adalah:",
        "P(A) = n(A) / n(S)",
        "n(A) = jumlah kejadian",
        "n(S) = jumlah seluruh kemungkinan"
      ],
      interaction: {
        type: "match",
        action: "matchProbabilityConcept",
        description: "Cocokkan istilah dengan arti yang benar",
        pairs: [
          { left: "P(A)", right: "Peluang kejadian A" },
          { left: "n(A)", right: "Jumlah kejadian yang diinginkan" },
          { left: "n(S)", right: "Jumlah seluruh kemungkinan" }
        ]
      }
    },

    // ================= Slide 3 =================
    {
      title: "Gunakan Rumus",
      content: [
        "Kotak berisi 6 bola merah dan 4 bola biru.",
        "Berapa peluang mengambil bola merah?",
        "Gunakan rumus yang sudah dipelajari."
      ],
      interaction: {
        type: "constructFraction",
        action: "constructProbabilityAnswer",
        description: "Bangun jawaban dengan memilih angka yang tepat",
        numeratorOptions: [6, 4, 10, 3],
        denominatorOptions: [6, 4, 10, 5],
        correct: {
          numerator: 6,
          denominator: 10
        },
        simplified: {
          numerator: 3,
          denominator: 5
        },
        feedback: {
          correct: "Benar! Kamu berhasil menggunakan rumus dengan tepat.",
          simplified: "Benar! Dan kamu menyederhanakan hasilnya.",
          wrong: "Coba lagi. Ingat: kejadian / total."
        }
      }
    },

    // ================= Slide 4 =================
    {
      title: "Mini Quiz",
      content: [
        "Dalam sebuah kotak terdapat:",
        "3 bola hijau, 3 bola merah, dan 4 bola biru.",
        "Berapa peluang mengambil bola biru?"
      ],
      interaction: {
        type: "multiStepQuiz",
        action: "probabilityQuizFlow",
        steps: [
          {
            question: "Berapa jumlah seluruh bola?",
            options: ["6", "10", "7", "12"],
            correct: "10"
          },
          {
            question: "Berapa jumlah bola biru?",
            options: ["2", "3", "4", "6"],
            correct: "4"
          },
          {
            question: "Berapa peluangnya?",
            options: ["4/10", "3/10", "4/6", "10/4"],
            correct: "4/10"
          }
        ],
        feedback: {
          correct: "Mantap! Kamu memahami konsep peluang secara bertahap.",
          wrong: "Masih keliru! Coba ulangi lagi dengan teliti.",
          tryAgain: "salah, coba lagi."
        }
      }
    },

    // ================= Slide 5 =================
    {
      title: "Tips Cepat",
      content: [
        "Selalu hitung total kemungkinan dulu.",
        "Tentukan kejadian yang diinginkan.",
        "Gunakan rumus: kejadian / total.",
        "Biasakan menyederhanakan hasil akhir."
      ],
      interaction: null
    }

  ],

  statue4: [
    // ================= Slide 1 =================
    {
      title: "Peluang Bisa Berubah",
      content: [
        "Di dalam kotak ada bola tenis dan bola basket.",
        "Ambil satu bola, lalu perhatikan apa yang berubah.",
        "Apakah peluang berikutnya masih sama?"
      ],
      interaction: {
        type: "conditionalReveal",
        action: "conditionalBallChange",
        description: "Ambil satu bola dan lihat bagaimana peluang berubah",
        setup: {
          balls: [
            { type: "tenis", count: 3 },
            { type: "basket", count: 2 }
          ]
        },
        display: {
          showRemaining: true,
          showProbability: true
        },
        feedback: {
          afterPick: "Sekarang jumlah bola berubah. Peluang berikutnya juga ikut berubah."
        }
      }
    },

    // ================= Slide 2 =================
    {
      title: "Peluang Bersyarat",
      content: [
        "Misalkan, bola pertama yang diambil adalah bola tenis.",
        "Berapa peluang pengambilan bola basket setelah bola tenis diambil?"
      ],
      interaction: {
        type: "conditionalFocus",
        action: "conditionalProbabilityFocus",
        description: null,
        setup: {
          initial: [
            { type: "tenis", count: 3 },
            { type: "basket", count: 2 }
          ],
          condition: {
            given: "tenis",
            label: "Diketahui bola pertama adalah tenis"
          }
        },
        question: {
          text: "Berapa peluang mengambil bola basket setelah tenis?",
          options: ["4/5", "1/3", "2/4", "3/4"],
          correct: "1/3"
        },
        feedback: {
          correct: "Benar! Kita hanya melihat kondisi setelah tenis terjadi.",
          wrong: "Perhatikan jumlah bola setelah kondisi terjadi."
        }
      }
    },

    // ================= Slide 3 =================
    {
      title: "Menghitung Peluang Bersyarat",
      content: [
        "Sekarang kita hitung peluang kejadian berurutan.",
        "Pertama, tentukan peluang kejadian pertama. Lalu, tentukan peluang kejadian kedua dengan syarat kejadian pertama sudah terjadi."
      ],
      interaction: {
        type: "multiStepConditional",
        action: "conditionalProbabilitySteps",
        description: null,
        setup: {
          balls: [
            { type: "tenis", count: 3 },
            { type: "basket", count: 2 }
          ],
          target: ["tenis", "basket"]
        },
        steps: [
          {
            question: "Berapa peluang mengambil bola tenis?",
            options: ["3/5", "2/5", "3/4", "5/2"],
            correct: "3/5",
            stepFeedback: {
              correct: "Benar! Peluang mengambil bola tenis adalah 3 dari 5. Ini adalah peluang kejadian pertama (P(A)).",
              wrong: "Coba lagi. Peluang = kejadian / total."
            }
          },
          {
            question: "Setelah tenis diambil satu, berapa peluang mengambil bola basket?",
            options: ["2/5", "2/4", "3/4", "4/3"],
            correct: "2/4",
            stepFeedback: {
              correct: "Benar! Setelah tenis diambil, tersisa 4 bola. Peluang mengambil basket sekarang 2 dari 4. Inilah yang disebut P(B | A).",
              wrong: "Coba lagi. Ingat kondisi sudah berubah setelah kejadian pertama."
            }
          },
          {
            question: "Gunakan rumus: P(A ∩ B) = P(A) × P(B | A). Berapa hasilnya?",
            options: ["15/10", "5/20", "6/10", "6/20"],
            correct: "6/20"
          }
        ],
        finalFeedback: {
          correct: "Benar! Peluang kedua kejadian terjadi berurutan adalah hasil perkalian P(A) dan P(B | A). Kamu sudah menggunakan rumus peluang bersyarat dengan tepat.",
          wrong: "Coba lagi. Ikuti urutan: kejadian pertama → kondisi → kalikan."
        }
      }
    },

    // ================= Slide 4 =================
    {
      title: "Tips Cepat Peluang Bersyarat",
      content: [
        "Gunakan langkah ini untuk menyelesaikan soal peluang bersyarat:",
        "",
        "1. Tentukan kejadian pertama → hitung P(A)",
        "2. Perhatikan perubahan setelah kejadian pertama",
        "3. Hitung peluang kedua berdasarkan kondisi → P(B | A)",
        "4. Kalikan: P(A ∩ B) = P(A) × P(B | A)",
        "",
        "Ingat:",
        "- Setelah satu kejadian terjadi, total dan komposisi bisa berubah",
        "- Jangan gunakan total awal untuk langkah kedua",
        "- Selalu kerjakan secara bertahap"
      ],
      interaction: null
    }
  ],

  statue5: [
    // ================= Slide 1 =================
    {
      title: "Kejadian Saling Bebas",
      content: [
        "Tidak semua kejadian saling mempengaruhi. Ada kejadian yang hasilnya tidak bergantung pada kejadian sebelumnya.",
        "Contohnya: melempar koin beberapa kali.",
        "Apakah hasil lemparan kedua dipengaruhi lemparan pertama?"
      ],
      interaction: {
        type: "independentIntro",
        action: "independentCoinIntro",
        description: "Lempar koin ke atas dua kali dan amati perubahan peluangnya"
      }
    },

    // ================= Slide 2 =================
    {
      title: "Peluang Tidak Berubah",
      content: [
        "Pada kejadian saling bebas, peluang tetap sama. Walaupun kejadian pertama sudah terjadi.",
        "Misalnya: P(Gambar) pada lemparan kedua tetap 1/2."
      ],
      interaction: {
        type: "independentDemo",
        action: "independentProbabilityDemo",
        description: "Bandingkan peluang sebelum dan sesudah lemparan pertama",
        setup: {
          event: "koin",
          outcomes: ["gambar", "angka"]
        },
        question: {
          text: "Jika lemparan pertama adalah gambar, berapa peluang gambar pada lemparan kedua?",
          options: ["1/2", "1/3", "2/3", "1/4"],
          correct: "1/2"
        },
        feedback: {
          correct: "Benar! Peluang tidak berubah karena kedua kejadian saling bebas.",
          wrong: "Coba lagi. Ingat: hasil sebelumnya tidak mempengaruhi."
        }
      }
    },

    // ================= Slide 3 =================
    {
      title: "Menghitung Peluang Saling Bebas",
      content: [
        "Untuk kejadian saling bebas, gunakan rumus: P(A ∩ B) = P(A) × P(B)",
        "Contoh: dua dadu dilempar bersamaan. Mari kita hitung peluang muncul angka tertentu."
      ],
      interaction: {
        type: "multiStepIndependent",
        action: "independentProbabilitySteps",
        setup: {
          event: "dadu",
          target: ["6", "6"]
        },
        steps: [
          {
            question: "Berapa peluang dadu pertama menghasilkan angka 6?",
            options: ["1/6", "1/3", "1/2", "1/5"],
            correct: "1/6",
            stepFeedback: {
              correct: "Benar! Peluang dadu pertama adalah 1 dari 6.",
              wrong: "Coba lagi. Peluang = kejadian / total."
            }
          },
          {
            question: "Berapa peluang dadu kedua menghasilkan angka 6?",
            options: ["1/4", "1/3", "1/6", "1/2"],
            correct: "1/6",
            stepFeedback: {
              correct: "Benar! Peluang dadu kedua juga adalah 1 dari 6. Ruang sample dadu sama sekali tidak berubah.",
              wrong: "Coba lagi. Peluang = kejadian / total."
            }
          },
          {
            question: "Gunakan rumus P(A ∩ B) = P(A) × P(B). Berapa hasilnya?",
            options: ["6/36", "1/36", "1/12", "1/6"],
            correct: "1/36"
          }
        ],
        finalFeedback: {
          correct: "Benar! Karena kedua kejadian saling bebas, peluangnya dikalikan: 1/6 × 1/6 = 1/36.",
          wrong: "Coba lagi. Ingat: karena saling bebas, peluang langsung dikalikan."
        }
      }
    },

    // ================= Slide 4 =================
    {
      title: "Tips Cepat",
      content: [
        "Gunakan konsep ini untuk mengenali kejadian saling bebas:",
        "",
        "1. Periksa apakah kejadian pertama mempengaruhi kejadian kedua",
        "2. Jika tidak → berarti saling bebas",
        "3. Gunakan rumus: P(A ∩ B) = P(A) × P(B)",
        "",
        "Contoh umum:",
        "- Lempar koin berulang",
        "- Lempar dadu berulang",
        "",
        "Ingat:",
        "Tidak semua kejadian itu bersyarat!"
      ],
      interaction: null
    }
  ]

};

export default materials;