import { useState } from 'react'
import { DocumentCard } from '../components/documents/DocumentCard'
import { DocumentList } from '../components/documents/DocumentList'
import { ReviewActions } from '../components/documents/ReviewActions'
import { ReviewOutcome } from '../components/documents/ReviewOutcome'
import { useDocuments, type Filter } from '../hooks/useDocuments'

export function ReviewerPage() {
  // Reviewers mostly care about what still needs a decision.
  const [filter, setFilter] = useState<Filter>('pending')
  const data = useDocuments(filter)

  return (
    <div className="mx-auto max-w-3xl">
      <DocumentList
        title="Review queue"
        filter={filter}
        onFilterChange={setFilter}
        data={data}
        emptyMessage={filter === 'pending' ? 'Nothing waiting for review. All caught up.' : 'No documents.'}
        renderDoc={(doc) => (
          <DocumentCard doc={doc} showAuthor>
            {doc.status === 'pending' ? (
              <ReviewActions doc={doc} onDone={data.reload} />
            ) : (
              <ReviewOutcome doc={doc} />
            )}
          </DocumentCard>
        )}
      />
    </div>
  )
}
