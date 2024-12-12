import React, { useEffect, useState, useRef, useCallback } from "react";
import VoteApi from "../services/vote";
import { useNavigate, useParams } from "react-router-dom";
import { GoToTopButton } from "../components";

type PollItem = {
  id: number;
  description: string;
  imageUrl: string | null;
  votingCount: number;
};

type Poll = {
  id: string;
  title: string;
  creatorName: string;
  responseType: string;
  pollType: string;
  endAt: string;
  readCount: number;
  totalVotingCount: number;
  items: PollItem[];
};

type PollResponse = {
  items: Poll[];
  page: number;
  size: number;
  totalCount: number;
  totalPage: number;
  empty: boolean;
};

const Search: React.FC = () => {
  const nav = useNavigate();
  const { searchTerm } = useParams<{ searchTerm: string }>();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchSearchPolls = async () => {
      try {
        if (searchTerm) {
          const response = await VoteApi.searchPolls(0, 30, searchTerm);
          const pollResponse: PollResponse = response.data.data;
          setPolls(pollResponse.items || []);
          setPage(0);
          setTotalPages(pollResponse.totalPage);
          setFetchedPages(new Set([0]));
        }
      } catch (error) {
        console.error("Failed to fetch search polls", error);
      }
    };

    fetchSearchPolls();
  }, [searchTerm]);

  const fetchMorePolls = async () => {
    const nextPage = page + 1;
    if (fetchedPages.has(nextPage) || nextPage >= totalPages) return;

    try {
      const response = await VoteApi.searchPolls(
        nextPage,
        30,
        searchTerm || ""
      );
      const pollResponse: PollResponse = response.data.data;
      setPolls((prevPolls) => [...prevPolls, ...(pollResponse.items || [])]);
      setPage(nextPage);
      setFetchedPages((prevPages) => new Set(prevPages.add(nextPage)));
    } catch (error) {
      console.error("Failed to fetch more polls", error);
    }
  };

  const lastPollElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMorePolls();
        }
      });
      if (node) observer.current.observe(node);
    },
    [page, searchTerm, fetchedPages, totalPages]
  );

  return (
    <div className="Search">
      <GoToTopButton />
      <div className="Inner">
        {/* 검색 결과 목록 */}
        <div className="EntirePollsContainer">
          <div className="EntireTitleBox">{searchTerm} 검색 결과</div>
          <div className="EntirePollsBox">
            {polls.map((poll, index) => (
              <div
                className="IndividualPoll"
                key={poll.id}
                ref={index === polls.length - 1 ? lastPollElementRef : null}
                onClick={() => nav(`/poll/${poll.id}`)}
              >
                <div className="Top">
                  <div className="Description">
                    <div className="Title">{poll.title}</div>
                    <div className="Detail">{`${new Date(
                      poll.endAt
                    ).toLocaleDateString()} 마감`}</div>
                  </div>
                  <div
                    className={`Now ${
                      new Date(poll.endAt) < new Date() ? "Expired" : ""
                    }`}
                  >
                    {new Date(poll.endAt) < new Date() ? "종료됨" : "진행 중"}
                  </div>
                </div>

                <div className="Options">
                  {poll.items.slice(0, 4).map((item) => (
                    <div className="IndividualOption" key={item.id}>
                      <div
                        className="Background"
                        style={{
                          backgroundImage: item.imageUrl
                            ? `url(${item.imageUrl})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {" "}
                      </div>
                      <div className="content">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
