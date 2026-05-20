const finalTestQuestions = [

    // ===== Topik 1: Apa itu Peluang (3 soal) =====
    {
        question: "Nilai peluang selalu berada di antara?",
        options: ["0 dan 1", "-1 dan 1", "0 dan 100", "1 dan 10"],
        correct: 0
    },
    {
        question: "Peluang kejadian yang mustahil adalah?",
        options: ["0", "1", "0.5", "Tidak ada"],
        correct: 0
    },
    {
        question: "Peluang kejadian yang pasti terjadi adalah?",
        options: ["0", "0.5", "1", "2"],
        correct: 2
    },

    // ===== Topik 2: Ruang Sampel & Kejadian (3 soal) =====
    {
        question: "Ruang sampel adalah?",
        options: ["Semua hasil yang mungkin", "Hanya hasil yang diinginkan", "Jumlah kejadian", "Peluang akhir"],
        correct: 0
    },
    {
        question: "Sebuah dadu dilempar. Berapa banyak anggota ruang sampelnya?",
        options: ["4", "5", "6", "3"],
        correct: 2
    },
    {
        question: "Kejadian adalah?",
        options: ["Semua hasil yang mungkin", "Bagian dari ruang sampel", "Jumlah seluruh peluang", "Hasil yang mustahil"],
        correct: 1
    },

    // ===== Topik 3: Rumus P(A) = n(A)/n(S) (3 soal) =====
    {
        question: "Rumus peluang kejadian A adalah?",
        options: ["n(A) / n(S)", "n(S) / n(A)", "n(A) × n(S)", "n(A) + n(S)"],
        correct: 0
    },
    {
        question: "Kotak berisi 3 bola merah dan 7 bola biru. Peluang mengambil bola merah?",
        options: ["3/10", "7/10", "3/7", "1/3"],
        correct: 0
    },
    {
        question: "Dadu dilempar sekali. Peluang muncul angka 4?",
        options: ["1/4", "1/5", "1/6", "4/6"],
        correct: 2
    },

    // ===== Topik 4: Peluang Bersyarat (3 soal) =====
    {
        question: "P(B|A) artinya?",
        options: ["Peluang B jika A sudah terjadi", "Peluang A dan B bersamaan", "Peluang A atau B", "Peluang B saja"],
        correct: 0
    },
    {
        question: "Rumus P(A ∩ B) untuk kejadian bersyarat adalah?",
        options: ["P(A) + P(B)", "P(A) × P(B|A)", "P(A) - P(B)", "P(B) / P(A)"],
        correct: 1
    },
    {
        question: "Kotak ada 3 tenis dan 2 basket. Setelah 1 tenis diambil, total bola yang tersisa?",
        options: ["5", "4", "3", "2"],
        correct: 1
    },

    // ===== Topik 5: Kejadian Saling Bebas (3 soal) =====
    {
        question: "Kejadian saling bebas artinya?",
        options: ["Saling mempengaruhi", "Tidak saling mempengaruhi", "Salah satu pasti terjadi", "Keduanya mustahil"],
        correct: 1
    },
    {
        question: "Rumus P(A ∩ B) untuk kejadian saling bebas?",
        options: ["P(A) + P(B)", "P(A) - P(B)", "P(A) × P(B)", "P(A) / P(B)"],
        correct: 2
    },
    {
        question: "Koin dilempar dua kali. Apakah lemparan pertama mempengaruhi lemparan kedua?",
        options: ["Ya, selalu", "Tidak, keduanya bebas", "Tergantung hasilnya", "Tidak diketahui"],
        correct: 1
    }

];

export default finalTestQuestions;