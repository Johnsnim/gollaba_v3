import React, { useEffect, useState, useRef, useCallback } from "react";
import VoteApi from "../services/vote";
import { useNavigate } from "react-router-dom";
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

const Main: React.FC = () => {
  const nav = useNavigate();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([]);
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchTopPolls = async () => {
      try {
        const response = await VoteApi.topPolls();
        setPolls(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch trending polls", error);
      }
    };

    const fetchTrendingPolls = async () => {
      try {
        const response = await VoteApi.trendingPolls();
        setTrendingPolls(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch trending polls", error);
      }
    };

    const fetchInitialAllPolls = async () => {
      try {
        const response = await VoteApi.getPolls(0, 30);
        const pollResponse: PollResponse = response.data.data;
        setAllPolls(pollResponse.items || []);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch all polls", error);
      }
    };

    fetchTopPolls();
    fetchTrendingPolls();
    fetchInitialAllPolls();
  }, []);

  const fetchMorePolls = async () => {
    try {
      const nextPage = page + 1;
      const response = await VoteApi.getPolls(nextPage, 30);
      const pollResponse: PollResponse = response.data.data;
      setAllPolls((prevPolls) => [...prevPolls, ...(pollResponse.items || [])]);
      setPage(nextPage);
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
    [page]
  );

  return (
    <div className="Main">
      <GoToTopButton />
      <div className="Inner">
        {/* 오늘의 투표 */}
        <div className="PollsContainer">
          <div className="TitleBox">오늘의 투표</div>
          <div className="PollsBox">
            {polls.map((poll) => (
              <div
                className="IndividualPoll"
                key={poll.id}
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

        {/* 두번째 투표 */}
        <div className="PollsContainer">
          <div className="TitleBox">인기 투표</div>
          <div className="PollsBox">
            {trendingPolls.map((poll) => (
              <div
                className="IndividualPoll"
                key={poll.id}
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

        {/* 전체목록 */}
        <div className="EntirePollsContainer">
          <div className="EntireTitleBox">전체 투표 보기</div>
          <div className="EntirePollsBox">
            {allPolls.map((poll, index) => (
              <div
                className="IndividualPoll"
                key={poll.id}
                ref={index === allPolls.length - 1 ? lastPollElementRef : null}
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

export default Main;
