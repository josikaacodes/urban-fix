import React, { useState } from 'react';

export interface CommunityIssue {
  id: string;
  category: 'Roads & Potholes' | 'Electricity & Lights' | 'Water & Drainage' | 'Garbage & Waste';
  title: string;
  description: string;
  location: string;
  distance: string;
  reportedBy: string;
  timestamp: string;
  status: string;
  statusColor: string;
  upvotes: number;
  userUpvoted: boolean;
  photoUrl?: string | null;
  comments: { author: string; text: string; time?: string }[];
}

interface CommunityFeedViewProps {
  onOpenReportModal?: () => void;
  onToast: (msg: string) => void;
  residentWard?: string;
}

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  onOpenReportModal,
  onToast,
  residentWard = 'Ward 174 (HSR Layout)',
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [id: string]: string }>({});

  const [communityIssues, setCommunityIssues] = useState<CommunityIssue[]>([
    {
      id: 'UF-2026-00142',
      category: 'Roads & Potholes',
      title: 'Deep 2-ft crater near 4th Cross junction',
      description: 'Two-wheelers are skidding in the dark. Deep crater formed after recent pipe repair.',
      location: '2nd Main & 4th Cross Rd, Sector 2',
      distance: '350m away',
      reportedBy: 'Akash S. (You)',
      timestamp: 'Today • 2 hours ago',
      status: 'Field Crew Assigned',
      statusColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
      upvotes: 38,
      userUpvoted: true,
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80',
      comments: [
        { author: 'Pooja R. (Sector 2)', text: 'I saw a scooter slip here last night. Please fix this soon!' },
        { author: 'Vikram K. (Resident)', text: 'BBMP road roller unit was seen inspecting nearby.' }
      ]
    },
    {
      id: 'UF-2026-00141',
      category: 'Electricity & Lights',
      title: 'Sparking street light pole outside Sector 3 park',
      description: 'Insulator broken and sparking when winds blow. Whole street dark for 3 days.',
      location: 'Cross Lane 7, Sector 3',
      distance: '650m away',
      reportedBy: 'Karthik R.',
      timestamp: 'Yesterday',
      status: 'Repaired (Needs Resident Sign-off)',
      statusColor: 'bg-[#e0f2fe] text-[#075985] border-[#bae6fd]',
      upvotes: 24,
      userUpvoted: false,
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=400&q=80',
      comments: [
        { author: 'Ananya M.', text: 'BESCOM van #08 completed wire patching this afternoon.' }
      ]
    },
    {
      id: 'UF-2026-00140',
      category: 'Water & Drainage',
      title: 'Broken potable water pipeline flooding pedestrian footpath',
      description: 'Clean drinking water gushing onto the road since 6 AM. Low pressure in nearby houses.',
      location: '17th Cross, Sector 1',
      distance: '1.1 km away',
      reportedBy: 'Santia L.',
      timestamp: 'Sep 24',
      status: 'Under Investigation',
      statusColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
      upvotes: 42,
      userUpvoted: false,
      photoUrl: null,
      comments: [
        { author: 'Ramesh N.', text: 'BWSSB water supply wing was notified by Ward office.' }
      ]
    },
    {
      id: 'UF-2026-00139',
      category: 'Garbage & Waste',
      title: 'Overflowing commercial garbage dump near school gate',
      description: 'Wet waste not picked up for 4 days. Strong odor and stray dogs gathering around.',
      location: '24th Main, Sector 2',
      distance: '480m away',
      reportedBy: 'Josikaa D.',
      timestamp: 'Sep 23',
      status: 'Verified & Closed',
      statusColor: 'bg-[#c9e4cc] text-[#092011] border-[#a3d9a9]',
      upvotes: 56,
      userUpvoted: true,
      photoUrl: null,
      comments: [
        { author: 'Health Inspector (BBMP)', text: 'Special compacting truck deployed. Area bleached and sanitized.' }
      ]
    }
  ]);

  const toggleUpvote = (id: string) => {
    setCommunityIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          const nextUpvoted = !issue.userUpvoted;
          const nextCount = nextUpvoted ? issue.upvotes + 1 : issue.upvotes - 1;
          onToast(
            nextUpvoted
              ? `+1 Added to #${id}! Notified municipal dispatch of higher neighborhood impact.`
              : `Upvote removed for #${id}.`
          );
          return {
            ...issue,
            userUpvoted: nextUpvoted,
            upvotes: nextCount
          };
        }
        return issue;
      })
    );
  };

  const postComment = (id: string) => {
    const text = (newCommentText[id] || '').trim();
    if (!text) return;

    setCommunityIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          return {
            ...issue,
            comments: [...issue.comments, { author: 'Akash S. (Resident)', text }]
          };
        }
        return issue;
      })
    );

    setNewCommentText((prev) => ({ ...prev, [id]: '' }));
    onToast('Comment posted to neighborhood thread.');
  };

  const filteredIssues = communityIssues.filter((issue) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'roads') return issue.category.includes('Roads');
    if (selectedFilter === 'electric') return issue.category.includes('Electricity');
    if (selectedFilter === 'water') return issue.category.includes('Water');
    if (selectedFilter === 'garbage') return issue.category.includes('Garbage');
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-[#c2c8c2]/40 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#a43711] font-bold uppercase mb-1">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>{residentWard} Neighborhood Stream</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-[#051c11]">
            Shared Civic Issues & Community Deduplication
          </h3>
          <p className="text-xs text-[#524f4a] font-body mt-1 max-w-2xl leading-relaxed">
            See what defects your neighbors have reported. If a pothole or power failure already affects your street, click{' '}
            <strong className="text-[#051c11]">"I'm Affected Too (+1)"</strong> to boost its priority instead of filing duplicate complaints!
          </p>
        </div>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 rounded-xl bg-[#1a3125] text-white font-mono text-xs font-semibold hover:bg-[#051c11] transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Report New Defect</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-[#c2c8c2]/30 p-3 text-xs font-mono">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Ward Issues' },
            { id: 'roads', label: 'Roads & Pavements' },
            { id: 'electric', label: 'Electricity & Grid' },
            { id: 'water', label: 'Water & Drainage' },
            { id: 'garbage', label: 'Sanitation & Waste' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedFilter === f.id
                  ? 'bg-[#1a3125] text-white font-bold'
                  : 'bg-[#f7f3ea] text-[#524f4a] hover:bg-[#ece8df] font-medium'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#727973]">
          Showing <strong className="text-[#051c11]">{filteredIssues.length}</strong> neighborhood reports
        </span>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-2xl border border-[#c2c8c2]/40 hover:border-[#4c6451] p-5 shadow-xs transition-all space-y-4"
          >
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ece8df] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#051c11]">#{issue.id}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f2ede4] text-[#1a3125] font-semibold uppercase">
                  {issue.category}
                </span>
                <span className="font-mono text-[11px] text-[#727973]">• {issue.timestamp}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-lg font-semibold ${issue.statusColor}`}>
                {issue.status}
              </span>
            </div>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {issue.photoUrl && (
                <div className="sm:col-span-3">
                  <div className="w-full h-28 bg-[#f2ede4] rounded-xl overflow-hidden border border-[#c2c8c2]/30">
                    <img src={issue.photoUrl} alt={issue.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className={issue.photoUrl ? 'sm:col-span-9 space-y-1.5' : 'sm:col-span-12 space-y-1.5'}>
                <h4 className="font-headline font-bold text-base text-[#051c11]">{issue.title}</h4>
                <p className="text-xs text-[#524f4a] font-body leading-relaxed">{issue.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#4e6753] pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#a43711]">location_on</span>
                    <span>
                      {issue.location} ({issue.distance})
                    </span>
                  </span>
                  <span className="text-[#727973]">
                    Reported by: <strong className="text-[#051c11]">{issue.reportedBy}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#ece8df] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleUpvote(issue.id)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    issue.userUpvoted
                      ? 'bg-[#a43711] text-white border-[#a43711] font-bold'
                      : 'bg-[#f7f3ea] text-[#1c1c16] border-[#c2c8c2]/50 hover:bg-[#ece8df] font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                  <span>I'm Affected Too (+1)</span>
                  <span className={`ml-1 px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    issue.userUpvoted ? 'bg-white/20 text-white' : 'bg-[#e8e1d5] text-[#1c1c16]'
                  }`}>
                    {issue.upvotes}
                  </span>
                </button>

                <span className="text-[11px] font-mono text-[#727973]">
                  {issue.upvotes > 30 ? '🔥 High Ward Priority' : 'Community Validated'}
                </span>
              </div>

              <button
                onClick={() => setOpenCommentsId(openCommentsId === issue.id ? null : issue.id)}
                className="text-xs font-mono text-[#4e6753] hover:text-[#051c11] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">forum</span>
                <span>Comments ({issue.comments.length})</span>
              </button>
            </div>

            {/* Comments Drawer */}
            {openCommentsId === issue.id && (
              <div className="pt-3 border-t border-[#ece8df] space-y-2.5 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  {issue.comments.map((c, i) => (
                    <div key={i} className="text-[11px] font-body text-[#1c1c16] bg-[#f7f3ea] border border-[#c2c8c2]/30 p-2.5 rounded-xl">
                      <strong className="font-mono text-[#051c11]">{c.author}: </strong>
                      {c.text}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newCommentText[issue.id] || ''}
                    onChange={(e) =>
                      setNewCommentText((prev) => ({ ...prev, [issue.id]: e.target.value }))
                    }
                    placeholder="Share a neighborhood update..."
                    className="flex-1 px-3 py-1.5 bg-[#f7f3ea] border border-[#c2c8c2]/50 rounded-xl font-body text-xs focus:outline-none focus:border-[#051c11]"
                  />
                  <button
                    onClick={() => postComment(issue.id)}
                    className="px-3 py-1.5 bg-[#1a3125] text-white font-mono text-xs font-semibold rounded-xl hover:bg-[#051c11] transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
