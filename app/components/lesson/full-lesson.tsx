import { useEffect, type ComponentProps } from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Github,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { CommentThread } from "~/components/comment-thread";
import { YouTubePlayer } from "~/components/youtube-player";
import { LessonProgressStatus } from "~/db/schema";
import { formatDuration } from "~/lib/utils";
import type {
  FlatLesson,
  FullLessonData,
} from "~/routes/courses.$slug.lessons.$lessonId";
import { BookmarkToggle } from "./bookmark-toggle";
import { CurriculumSidebar } from "./curriculum-sidebar";
import { LessonBreadcrumb } from "./lesson-breadcrumb";
import { LessonContent } from "./lesson-content";
import { LessonNote } from "./lesson-note";
import { QuizSection } from "./quiz-section";
import { useAutoplay } from "./use-autoplay";

type QuizSectionProps = ComponentProps<typeof QuizSection>;

export function FullLesson({ data }: { data: FullLessonData }) {
  const quizFetcher = useFetcher({ key: `quiz-${data.lesson.id}` });
  const quizResult = quizFetcher.data?.quizResult ?? null;

  return (
    <div className="flex">
      <CurriculumSidebar
        course={data.course}
        curriculum={data.curriculum}
        currentLessonId={data.lesson.id}
        lessonProgressMap={data.lessonProgressMap}
        enrolled={data.enrolled}
      />

      <div className="flex-1 p-6 lg:p-8">
        <LessonBreadcrumb
          course={data.course}
          mod={data.module}
          lessonTitle={data.lesson.title}
        />

        <div className="mx-auto max-w-4xl">
          <LessonHeading data={data} />
          <LessonMedia data={data} />
          {/* Note — under the video, so the Student can write while they watch */}
          {data.currentUserId && <LessonNote note={data.note} />}
          <LessonContent
            contentHtml={data.contentHtml}
            hasVideo={!!data.lesson.videoUrl}
          />
          <LessonQuiz
            data={data}
            quizFetcher={quizFetcher}
            quizResult={quizResult}
          />
          <LessonCompletion data={data} />
          <LessonDiscussion data={data} />
          <LessonNavigation
            course={data.course}
            prevLesson={data.prevLesson}
            nextLesson={data.nextLesson}
          />
        </div>
      </div>
    </div>
  );
}

function LessonHeading({ data }: { data: FullLessonData }) {
  const { lesson, currentUserId, bookmarked, readingMinutes } = data;

  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        {currentUserId && <BookmarkToggle bookmarked={bookmarked} />}
      </div>
      <div className="mb-6 flex items-center gap-3">
        {lesson.durationMinutes && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {formatDuration(lesson.durationMinutes, true, false, false)}
          </div>
        )}
        {readingMinutes !== null && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            {readingMinutes} min read
          </div>
        )}
        {lesson.githubRepoUrl && (
          <a
            href={lesson.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <Github className="mr-1.5 size-4" />
              Open Code
            </Button>
          </a>
        )}
      </div>
    </>
  );
}

function LessonMedia({ data }: { data: FullLessonData }) {
  const [autoplay, toggleAutoplay] = useAutoplay();
  const { lesson, enrolled, currentUserId } = data;

  if (!lesson.videoUrl) return null;

  return (
    <YouTubePlayer
      videoUrl={lesson.videoUrl}
      lessonId={lesson.id}
      title={lesson.title}
      startPosition={data.lastWatchPosition}
      durationMinutes={lesson.durationMinutes}
      watchProgress={data.watchProgress}
      trackingEnabled={enrolled && !!currentUserId}
      autoplay={autoplay}
      onToggleAutoplay={toggleAutoplay}
    />
  );
}

function LessonQuiz({
  data,
  quizFetcher,
  quizResult,
}: {
  data: FullLessonData;
  quizFetcher: QuizSectionProps["quizFetcher"];
  quizResult: QuizSectionProps["quizResult"];
}) {
  const { quiz, bestAttempt, enrolled, currentUserId } = data;

  if (!quiz || !enrolled || !currentUserId) return null;

  return (
    <QuizSection
      quiz={quiz}
      bestAttempt={bestAttempt}
      quizResult={quizResult}
      quizFetcher={quizFetcher}
      isSubmitting={quizFetcher.state !== "idle"}
    />
  );
}

function LessonCompletion({ data }: { data: FullLessonData }) {
  const { lesson, course, lessonStatus, nextLesson, enrolled, currentUserId } =
    data;
  const fetcher = useFetcher({ key: `mark-complete-${lesson.id}` });
  const navigate = useNavigate();

  const isMarking =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === "mark-complete";
  const justCompleted = fetcher.data?.success;
  const isCompleted =
    lessonStatus === LessonProgressStatus.Completed || justCompleted;

  // Navigate to next lesson after marking complete
  useEffect(() => {
    if (justCompleted && nextLesson) {
      navigate(`/courses/${course.slug}/lessons/${nextLesson.id}`);
    }
  }, [justCompleted, nextLesson, course.slug, navigate]);

  if (!enrolled || !currentUserId) return null;

  return (
    <div className="mb-8">
      {isCompleted ? (
        <CompletedLesson courseSlug={course.slug} nextLesson={nextLesson} />
      ) : (
        <CompleteLessonForm
          fetcher={fetcher}
          nextLesson={nextLesson}
          isMarking={isMarking}
        />
      )}
    </div>
  );
}

function CompletedLesson({
  courseSlug,
  nextLesson,
}: {
  courseSlug: string;
  nextLesson: FlatLesson | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="size-5" />
        <span className="font-medium">Lesson completed</span>
      </div>
      {nextLesson && (
        <Link to={`/courses/${courseSlug}/lessons/${nextLesson.id}`}>
          <Button variant="outline" size="sm">
            Up next: {nextLesson.title}
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function CompleteLessonForm({
  fetcher,
  nextLesson,
  isMarking,
}: {
  fetcher: ReturnType<typeof useFetcher>;
  nextLesson: FlatLesson | null;
  isMarking: boolean;
}) {
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="mark-complete" />
      <Button disabled={isMarking}>
        {isMarking ? (
          nextLesson ? (
            "Completing..."
          ) : (
            "Marking..."
          )
        ) : nextLesson ? (
          <>
            Up next: {nextLesson.title}
            <ChevronRight className="ml-1 size-4" />
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 size-4" />
            Mark as Complete
          </>
        )}
      </Button>
    </fetcher.Form>
  );
}

function LessonDiscussion({ data }: { data: FullLessonData }) {
  return (
    <CommentThread
      comments={data.comments}
      currentUserId={data.currentUserId}
      canModerate={data.canModerate}
      canPost
      instructorName={data.instructorName}
    />
  );
}

function LessonNavigation({
  course,
  prevLesson,
  nextLesson,
}: {
  course: { id: number; title: string; slug: string };
  prevLesson: FlatLesson | null;
  nextLesson: FlatLesson | null;
}) {
  return (
    <div className="flex items-center justify-between border-t pt-6">
      {prevLesson ? (
        <PreviousLessonLink courseSlug={course.slug} lesson={prevLesson} />
      ) : (
        <div />
      )}

      {nextLesson ? (
        <NextLessonLink courseSlug={course.slug} lesson={nextLesson} />
      ) : (
        <BackToCourseLink course={course} />
      )}
    </div>
  );
}

function PreviousLessonLink({
  courseSlug,
  lesson,
}: {
  courseSlug: string;
  lesson: FlatLesson;
}) {
  return (
    <Link
      to={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className="flex items-center gap-2 text-sm hover:text-foreground text-muted-foreground"
    >
      <ChevronLeft className="size-4" />
      <div>
        <div className="text-xs text-muted-foreground">Previous</div>
        <div className="font-medium text-foreground">{lesson.title}</div>
      </div>
    </Link>
  );
}

function NextLessonLink({
  courseSlug,
  lesson,
}: {
  courseSlug: string;
  lesson: FlatLesson;
}) {
  return (
    <Link
      to={`/courses/${courseSlug}/lessons/${lesson.id}`}
      className="flex items-center gap-2 text-right text-sm hover:text-foreground text-muted-foreground"
    >
      <div>
        <div className="text-xs text-muted-foreground">Next</div>
        <div className="font-medium text-foreground">{lesson.title}</div>
      </div>
      <ChevronRight className="size-4" />
    </Link>
  );
}

function BackToCourseLink({
  course,
}: {
  course: { title: string; slug: string };
}) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <div>
        <div className="text-xs text-muted-foreground">Back to</div>
        <div className="font-medium text-foreground">{course.title}</div>
      </div>
      <ChevronRight className="size-4" />
    </Link>
  );
}
