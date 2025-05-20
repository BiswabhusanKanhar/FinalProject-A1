import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <input
      type="text"
      className="form-control"
      placeholder="Search exams..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{ maxWidth: "500px" }}
    />
  );
};

export default SearchBar;