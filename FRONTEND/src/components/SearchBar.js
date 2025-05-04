

import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
return (
    <input
    type="text"
    placeholder="Search exams..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="p-2 border rounded w-full"
    />
);
};

export default SearchBar;