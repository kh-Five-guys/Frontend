import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../css/MainCss/Quiz.module.css';

function Quiz() {
    const [quizzes, setQuizzes] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]); // 사용자의 답변을 저장

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get('http://localhost:9999/randomquiz');
            setQuizzes(response.data);
            setCurrentQuestionIndex(0);
            setScore(0);
            setShowScore(false);
            setUserAnswers([]); // 초기화
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    const handleAnswer = (selectedAnswer) => {
        const isCorrect = selectedAnswer === quizzes[currentQuestionIndex].correctAnswer;
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }

        setUserAnswers(prevAnswers => [
            ...prevAnswers,
            { 
                questionText: quizzes[currentQuestionIndex].questionText,
                correctAnswer: quizzes[currentQuestionIndex].correctAnswer,
                userAnswer: selectedAnswer,
                isCorrect: isCorrect
            }
        ]);

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < quizzes.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            setShowScore(true);
        }
    };

    const handleRetry = () => {
        fetchQuizzes();
    };

    const getStageImage = (score) => {
        switch(score) {
            case 0: return "/images/main/quizemo/emo1.png";
            case 1: return "/images/main/quizemo/emo2.png";
            case 2: return "/images/main/quizemo/emo3.png";
            case 3: return "/images/main/quizemo/emo4.png";
            case 4: return "/images/main/quizemo/emo5.png";
            case 5: return "/images/main/quizemo/emo6.png";
            default: return null;
        }
    };

    if (quizzes.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.quizContainer}>
            <img src="/images/main/questitle.png" alt="Sample Image" className={styles.questionTitle} />
            {showScore ? (
                <div className={styles.scoreSection}>
                    <div className={styles.changeemo}>
                        <p>점수: {score} / {quizzes.length}</p>
                        <img src={getStageImage(score)} alt={`Stage ${score}`} className={styles.stageImage} />

                    </div>
                    
                    
                    <div className={styles.reviewSection}>
                        <div className={styles.board_separator}>
                            <span className={styles.board_separator_text}>문제 풀이</span>
                        </div>
                        {userAnswers.map((answer, index) => (
                            <div key={index} className={answer.isCorrect ? styles.correct : styles.incorrect}>
                                <div className={styles.ansfont}>문제: {answer.questionText} </div>
                                <div className={styles.ansfont}>
                                    답변: {answer.userAnswer} /
                                    정답: {answer.correctAnswer}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleRetry} className={styles.restartButton}>다시 풀기</button>
                </div>
            ) : (
                <div className={styles.questionSection}>
                    <img src="/images/main/question.png" alt="Sample Image" className={styles.queImg} />
                    <div className={styles.questionAll}>
                        <div className={styles.questionCount}>
                            <span>{currentQuestionIndex + 1}</span> / {quizzes.length}
                        </div>
                        <div className={styles.questionText}>
                            {quizzes[currentQuestionIndex].questionText}
                        </div>
                        <div className={styles.answerSection}>
                            <button onClick={() => handleAnswer('O')} className={styles.COR}>O</button>
                            <button onClick={() => handleAnswer('X')} className={styles.WRO}>X</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Quiz;
