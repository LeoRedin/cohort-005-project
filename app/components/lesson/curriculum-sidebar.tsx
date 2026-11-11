import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, ChevronDown, Circle, PlayCircle } from "lucide-react";
import { LessonProgressStatus } from "~/db/schema";
import { cn } from "~/lib/utils";

type Curriculum = Array<{
  id: number;
  title: string;
  lessons: Array<{ id: number; title: string }>;
}>;

export function CurriculumSidebar({
  course,
  curriculum,
  currentLessonId,
  lessonProgressMap,
  enrolled,
}: {
  course: { id: number; title: string; slug: string };
  curriculum: Curriculum;
  currentLessonId: number;
  lessonProgressMap: Record<number, string>;
  enrolled: boolean;
}) {
  // Find which module the current lesson belongs to
  const currentModuleId = curriculum.find((module) =>
    module.lessons.some((lesson) => lesson.id === currentLessonId)
  )?.id;

  const { expandedModules, toggleModule } = useExpandedModules(currentModuleId);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border lg:block">
      <div className="sticky top-0 flex h-screen flex-col overflow-y-auto">
        <div className="border-b border-border p-4">
          <Link
            to={`/courses/${course.slug}`}
            className="text-sm font-semibold hover:text-primary"
          >
            {course.title}
          </Link>
        </div>

        <nav className="flex-1 p-2">
          {curriculum.map((module) => (
            <CurriculumModule
              key={module.id}
              module={module}
              courseSlug={course.slug}
              currentLessonId={currentLessonId}
              lessonProgressMap={lessonProgressMap}
              expanded={expandedModules.has(module.id)}
              enrolled={enrolled}
              onToggle={() => toggleModule(module.id)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function useExpandedModules(currentModuleId: number | undefined) {
  // Start with current module expanded
  const [expandedModules, setExpandedModules] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (currentModuleId) initial.add(currentModuleId);
    return initial;
  });

  function toggleModule(moduleId: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  return { expandedModules, toggleModule };
}

function CurriculumModule({
  module,
  courseSlug,
  currentLessonId,
  lessonProgressMap,
  expanded,
  enrolled,
  onToggle,
}: {
  module: Curriculum[number];
  courseSlug: string;
  currentLessonId: number;
  lessonProgressMap: Record<number, string>;
  expanded: boolean;
  enrolled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
      >
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            !expanded && "-rotate-90"
          )}
        />
        <span className="flex-1 text-left">{module.title}</span>
      </button>

      {expanded && (
        <ul className="ml-4 space-y-0.5 py-1">
          {module.lessons.map((lesson) => (
            <CurriculumLesson
              key={lesson.id}
              lesson={lesson}
              courseSlug={courseSlug}
              isCurrent={lesson.id === currentLessonId}
              status={lessonProgressMap[lesson.id]}
              enrolled={enrolled}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CurriculumLesson({
  lesson,
  courseSlug,
  isCurrent,
  status,
  enrolled,
}: {
  lesson: { id: number; title: string };
  courseSlug: string;
  isCurrent: boolean;
  status: string | undefined;
  enrolled: boolean;
}) {
  const isCompleted = status === LessonProgressStatus.Completed;
  const isInProgress = status === LessonProgressStatus.InProgress;

  return (
    <li>
      <Link
        to={`/courses/${courseSlug}/lessons/${lesson.id}`}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
          isCurrent
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {enrolled ? (
          isCompleted ? (
            <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
          ) : isInProgress ? (
            <PlayCircle className="size-3.5 shrink-0 text-blue-500" />
          ) : (
            <Circle className="size-3.5 shrink-0" />
          )
        ) : (
          <Circle className="size-3.5 shrink-0" />
        )}
        <span className="truncate">{lesson.title}</span>
      </Link>
    </li>
  );
}
