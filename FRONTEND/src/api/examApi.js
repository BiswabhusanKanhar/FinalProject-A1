export const fetchExams = async () => {
    const response = await fetch("https://api.example.com/exams");
    return response.json();
};
