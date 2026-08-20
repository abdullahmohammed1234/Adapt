"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ConceptCard } from "@/features/subjects/ConceptCard";
import type { ConceptSummary, SubjectDetail } from "@/lib/types";

function matches(concept: ConceptSummary, query: string): boolean {
  if (!query) return true;
  const haystack = `${concept.name} ${concept.description} ${concept.topic_id}`.toLowerCase();
  return haystack.includes(query);
}

export function ConceptExplorer({
  subject,
  onStart,
}: {
  subject: SubjectDetail;
  onStart: (conceptId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const concepts = subject.concepts || [];
  const recommendedId = subject.recommended?.concept_id;
  const filtered = useMemo(
    () => concepts.filter((concept) => matches(concept, query.trim().toLowerCase())),
    [concepts, query],
  );
  const recommended = filtered.filter(
    (concept) => concept.recommended || concept.concept_id === recommendedId,
  );
  const recent = filtered.filter(
    (concept) => (concept.attempts || 0) > 0 || Boolean(concept.progress_percent),
  );
  const topics = subject.topics?.length
    ? subject.topics
    : Array.from(new Set(filtered.map((item) => item.topic_id))).map((topic_id) => ({
        topic_id,
        subject_id: subject.subject_id,
        name: topic_id.replaceAll("_", " "),
      }));

  if (!concepts.length) {
    return (
      <EmptyState
        title="No concepts yet"
        message="This subject does not have available concepts right now."
        href="/subjects"
        actionLabel="Choose another subject"
      />
    );
  }

  return (
    <div className="grid gap-10">
      <label className="block max-w-md">
        <span className="mb-2 block text-sm font-semibold">Find a concept</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search this subject"
          className="w-full rounded-[var(--radius)] border border-line bg-paper px-4 py-3"
        />
      </label>

      {recommended.length ? (
        <section>
          <p className="kicker">What should I learn next?</p>
          <h2 className="title-section mt-2">Recommended</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recommended.map((concept) => (
              <ConceptCard key={concept.concept_id} concept={concept} onStart={onStart} />
            ))}
          </div>
        </section>
      ) : null}

      {recent.length ? (
        <section>
          <p className="kicker">This visit</p>
          <h2 className="title-section mt-2">Recently explored</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recent.map((concept) => (
              <ConceptCard key={`recent-${concept.concept_id}`} concept={concept} onStart={onStart} />
            ))}
          </div>
        </section>
      ) : null}

      {topics.map((topic) => {
        const group = filtered.filter((concept) => concept.topic_id === topic.topic_id);
        if (!group.length) return null;
        return (
          <section key={topic.topic_id}>
            <p className="kicker">Topic</p>
            <h2 className="title-section mt-2">{topic.name}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {group.map((concept) => (
                <ConceptCard key={concept.concept_id} concept={concept} onStart={onStart} />
              ))}
            </div>
          </section>
        );
      })}
      {filtered.filter((concept) => !topics.some((topic) => topic.topic_id === concept.topic_id)).length ? (
        <section>
          <p className="kicker">Topic</p>
          <h2 className="title-section mt-2">More concepts</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {filtered
              .filter((concept) => !topics.some((topic) => topic.topic_id === concept.topic_id))
              .map((concept) => (
                <ConceptCard key={concept.concept_id} concept={concept} onStart={onStart} />
              ))}
          </div>
        </section>
      ) : null}

      {!filtered.length ? (
        <p className="text-muted">No concepts match that search.</p>
      ) : null}
    </div>
  );
}
