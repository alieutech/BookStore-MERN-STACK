// 10 sample books to fill a new store (used by `npm run seed`). Covers come from Open Library by ISBN;
// `?default=false` makes a missing cover fail, so the app shows its styled placeholder instead.
const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

module.exports = [
    // African literature
    { title: 'Things Fall Apart', author: 'Chinua Achebe', publishYear: 1958, price: 650, stock: 25, category: 'African Literature', image: cover('9780385474542'), description: 'Okonkwo, a proud Igbo leader, watches his village and his own life change forever when colonial rule and missionaries arrive. A cornerstone of modern African fiction.' },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', publishYear: 2006, price: 900, stock: 15, category: 'African Literature', image: cover('9781400095209'), description: 'Three lives are swept up in the Nigerian Civil War in this moving story of love, loyalty and survival.' },
    { title: 'Roots', author: 'Alex Haley', publishYear: 1976, price: 1100, stock: 8, category: 'African Literature', image: cover('9780440174646'), description: 'The saga of Kunta Kinte, taken from Juffure in The Gambia and enslaved in America, and of the generations that followed him.' },

    // Fiction
    { title: 'The Alchemist', author: 'Paulo Coelho', publishYear: 1988, price: 600, stock: 30, category: 'Fiction', image: cover('9780062315007'), description: 'A young shepherd travels from Spain to the Egyptian desert in search of treasure, and learns to listen to his heart.' },
    { title: '1984', author: 'George Orwell', publishYear: 1949, price: 550, stock: 20, category: 'Fiction', image: cover('9780451524935'), description: 'In a state where Big Brother is always watching, Winston Smith dares to think for himself.' },

    // Programming
    { title: 'Clean Code', author: 'Robert C. Martin', publishYear: 2008, price: 1800, stock: 12, category: 'Programming', image: cover('9780132350884'), description: 'Practical rules and examples for writing code that is easy to read, change and trust.' },
    { title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', publishYear: 2019, price: 1900, stock: 10, category: 'Programming', image: cover('9780135957059'), description: 'Timeless advice on the habits, tools and attitudes that make a great software developer.' },

    // Self-help
    { title: 'Atomic Habits', author: 'James Clear', publishYear: 2018, price: 950, stock: 35, category: 'Self-help', image: cover('9780735211292'), description: 'Small changes, remarkable results: a practical system for building good habits and breaking bad ones.' },

    // History, science & biography
    { title: 'Sapiens', author: 'Yuval Noah Harari', publishYear: 2011, price: 1000, stock: 16, category: 'History', image: cover('9780062316097'), description: 'A brief history of humankind, from the first humans to the age of science and capitalism.' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela', publishYear: 1994, price: 1100, stock: 9, category: 'Biography', image: cover('9780316548182'), description: 'Nelson Mandela tells his own story, from his childhood to 27 years in prison and the end of apartheid.' },
];
