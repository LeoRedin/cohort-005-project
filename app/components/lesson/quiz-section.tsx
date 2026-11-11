import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import {
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

type QuizQuestionData = {
  id: number;
  questionText: string;
  questionType: string;
  position: number;
  options: Array<{ id: number; optionText: string }>;
};

type QuizData = {
  id: number;
  title: string;
  passingScore: number;
  questions: QuizQuestionData[];
};

type QuizQuestionResultData = {
  questionId: number;
  correct: boolean;
  selectedOptionId: number | null;
  correctOptionId: number | null;
};

type QuizResultData = {
  attemptId: number;
  score: number;
  passed: boolean;
  grade: string;
  totalCorrect: number;
  totalQuestions: number;
  questionResults: QuizQuestionResultData[];
};

type QuizFetcher = ReturnType<typeof useFetcher>;

export function QuizSection({
  quiz,
  bestAttempt,
  quizResult,
  quizFetcher,
  isSubmitting,
}: {
  quiz: QuizData;
  bestAttempt: { score: number; passed: boolean } | null;
  quizResult: QuizResultData | null;
  quizFetcher: QuizFetcher;
  isSubmitting: boolean;
}) {
  const {
    selectedAnswers,
    showQuiz,
    setShowQuiz,
    retaking,
    setRetaking,
    selectAnswer,
    retakeQuiz,
  } = useQuizState(bestAttempt);

  useQuizToast(quizResult, retaking);

  if (quizResult && !retaking) {
    return (
      <QuizResultCard quiz={quiz} result={quizResult} onRetake={retakeQuiz} />
    );
  }

  if (!showQuiz && bestAttempt?.passed) {
    return (
      <QuizPassedCard
        quiz={quiz}
        bestAttempt={bestAttempt}
        onRetake={() => setShowQuiz(true)}
      />
    );
  }

  return (
    <QuizForm
      quiz={quiz}
      quizFetcher={quizFetcher}
      selectedAnswers={selectedAnswers}
      isSubmitting={isSubmitting}
      onSelect={selectAnswer}
      onSubmit={() => setRetaking(false)}
    />
  );
}

function useQuizState(bestAttempt: { score: number; passed: boolean } | null) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showQuiz, setShowQuiz] = useState(!bestAttempt?.passed);
  const [retaking, setRetaking] = useState(false);

  function selectAnswer(questionId: number, optionId: number) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function retakeQuiz() {
    setSelectedAnswers({});
    setRetaking(true);
  }

  return {
    selectedAnswers,
    showQuiz,
    setShowQuiz,
    retaking,
    setRetaking,
    selectAnswer,
    retakeQuiz,
  };
}

function useQuizToast(quizResult: QuizResultData | null, retaking: boolean) {
  useEffect(() => {
    if (quizResult && !retaking) {
      if (quizResult.passed) {
        toast.success(
          `Quiz passed! Score: ${Math.round(quizResult.score * 100)}%`
        );
      } else {
        toast.error(
          `Quiz not passed. Score: ${Math.round(quizResult.score * 100)}%`
        );
      }
    }
  }, [quizResult, retaking]);
}

function QuizTitle({ quiz }: { quiz: QuizData }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <HelpCircle className="size-5 text-primary" />
      <h2 className="text-xl font-semibold">{quiz.title}</h2>
    </div>
  );
}

function QuizResultCard({
  quiz,
  result,
  onRetake,
}: {
  quiz: QuizData;
  result: QuizResultData;
  onRetake: () => void;
}) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <QuizTitle quiz={quiz} />
        <QuizResultSummary result={result} />

        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <QuizQuestionResult
              key={question.id}
              question={question}
              index={index}
              result={result.questionResults.find(
                (item) => item.questionId === question.id
              )}
            />
          ))}
        </div>

        {!result.passed && (
          <div className="mt-6">
            <Button variant="outline" onClick={onRetake}>
              <RotateCcw className="mr-2 size-4" />
              Retake Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuizResultSummary({ result }: { result: QuizResultData }) {
  return (
    <div
      className={`mb-6 rounded-lg p-4 ${result.passed ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}
    >
      <div className="flex items-center gap-3">
        {result.passed ? (
          <Trophy className="size-8 text-green-600" />
        ) : (
          <XCircle className="size-8 text-red-600" />
        )}
        <div>
          <p
            className={`text-lg font-semibold ${result.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {result.passed ? "You passed!" : "Not quite — try again!"}
          </p>
          <p className="text-sm text-muted-foreground">
            Score: {result.totalCorrect}/{result.totalQuestions} (
            {Math.round(result.score * 100)}%) — Grade: {result.grade}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuizQuestionResult({
  question,
  index,
  result,
}: {
  question: QuizQuestionData;
  index: number;
  result: QuizQuestionResultData | undefined;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-start gap-2">
        {result?.correct ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
        ) : (
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
        )}
        <p className="font-medium">
          {index + 1}. {question.questionText}
        </p>
      </div>
      <div className="ml-7 space-y-1">
        {question.options.map((option) => (
          <QuizOptionLine key={option.id} option={option} result={result} />
        ))}
      </div>
    </div>
  );
}

function QuizOptionLine({
  option,
  result,
}: {
  option: { id: number; optionText: string };
  result: QuizQuestionResultData | undefined;
}) {
  const isSelected = result?.selectedOptionId === option.id;
  const isCorrect = result?.correctOptionId === option.id;
  let className = "text-sm";
  if (isCorrect) {
    className += " font-medium text-green-700 dark:text-green-400";
  } else if (isSelected && !result?.correct) {
    className += " text-red-600 dark:text-red-400 line-through";
  }

  return (
    <p className={className}>
      {isCorrect ? "✓ " : isSelected ? "✗ " : "  "}
      {option.optionText}
    </p>
  );
}

function QuizPassedCard({
  quiz,
  bestAttempt,
  onRetake,
}: {
  quiz: QuizData;
  bestAttempt: { score: number; passed: boolean };
  onRetake: () => void;
}) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-green-600" />
            <span className="font-medium">{quiz.title}</span>
            <span className="text-sm text-muted-foreground">
              — Best score: {Math.round(bestAttempt.score * 100)}%
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onRetake}>
            <RotateCcw className="mr-2 size-4" />
            Retake
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuizForm({
  quiz,
  quizFetcher,
  selectedAnswers,
  isSubmitting,
  onSelect,
  onSubmit,
}: {
  quiz: QuizData;
  quizFetcher: QuizFetcher;
  selectedAnswers: Record<number, number>;
  isSubmitting: boolean;
  onSelect: (questionId: number, optionId: number) => void;
  onSubmit: () => void;
}) {
  const allAnswered = quiz.questions.every(
    (question) => selectedAnswers[question.id] !== undefined
  );

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <QuizTitle quiz={quiz} />
        <p className="mb-6 text-sm text-muted-foreground">
          Answer all questions and submit. Passing score:{" "}
          {Math.round(quiz.passingScore * 100)}%.
        </p>

        <quizFetcher.Form method="post" onSubmit={onSubmit}>
          <input type="hidden" name="intent" value="submit-quiz" />
          <input type="hidden" name="quizId" value={quiz.id} />

          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <QuizQuestion
                key={question.id}
                question={question}
                index={index}
                selectedOptionId={selectedAnswers[question.id]}
                onSelect={onSelect}
              />
            ))}
          </div>

          <QuizSubmit allAnswered={allAnswered} isSubmitting={isSubmitting} />
        </quizFetcher.Form>
      </CardContent>
    </Card>
  );
}

function QuizSubmit({
  allAnswered,
  isSubmitting,
}: {
  allAnswered: boolean;
  isSubmitting: boolean;
}) {
  return (
    <div className="mt-6">
      <Button type="submit" disabled={!allAnswered || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Quiz"}
      </Button>
      {!allAnswered && (
        <p className="mt-2 text-sm text-muted-foreground">
          Please answer all questions before submitting.
        </p>
      )}
    </div>
  );
}

function QuizQuestion({
  question,
  index,
  selectedOptionId,
  onSelect,
}: {
  question: QuizQuestionData;
  index: number;
  selectedOptionId: number | undefined;
  onSelect: (questionId: number, optionId: number) => void;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 font-medium">
        {index + 1}. {question.questionText}
      </p>
      <div className="space-y-2">
        {question.options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedOptionId === option.id}
              onChange={() => onSelect(question.id, option.id)}
              className="size-4 accent-primary"
            />
            <span className="text-sm">{option.optionText}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
