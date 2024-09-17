import { useLocation, useNavigate } from "react-router-dom";
import { Logo, SearchIcon } from "../../asset";

const Header = () => {
  const nav = useNavigate();
  const loc = useLocation();

  if (loc.pathname === "/login") return null;

  return (
    <div className="Header">
      <div className="HeaderInner">
        <div className="HeaderLeft">
          <img
            src={Logo}
            alt="Logo"
            onClick={() => {
              nav("/");
            }}
          />
          <div
            className="Gollaba"
            onClick={() => {
              nav("/");
            }}
          >
            골라바
          </div>
          <div className="SearchBar">
            <img src={SearchIcon} alt="SearchIcon" />
            <input
              type="Text"
              className="SearchTermInput"
              placeholder="제목으로 투표를 검색하세요."
            />
          </div>
        </div>

        <div className="HeaderRight">
          <div
            className="HeaderButton"
            style={{ backgroundColor: "#478AD1" }}
            onClick={() => {
              nav("/write");
            }}
          >
            투표 만들기
          </div>
          <div
            className="HeaderButton"
            onClick={() => {
              nav("/login");
            }}
          >
            로그인
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
