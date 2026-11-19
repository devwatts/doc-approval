import { useState } from 'react'
import { DocumentCard } from '../components/documents/DocumentCard'
import { DocumentList } from '../components/documents/DocumentList'
import { ReviewOutcome } from '../components/documents/ReviewOutcome'
import { SubmitForm } from '../components/documents/SubmitForm'
import { useDocuments, type Filter } from '../hooks/useDocuments'

export function SubmitterPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const data = useDocuments(filter)

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <SubmitForm onSubmitted={data.reload} />
      <DocumentList
        title="My submissions"
        filter={filter}
        onFilterChange={setFilter}
        data={data}
        emptyMessage={filter === 'all' ? "You haven't submitted anything yet." : `No ${filter} documents.`}
        renderDoc={(doc) => (
          <DocumentCard doc={doc}>
            <ReviewOutcome doc={doc} />
          </DocumentCard>
        )}
      />
    </div>
  )
}
