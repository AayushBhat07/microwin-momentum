import { useState, FC, ReactNode } from "react";
import "./Folder.css";

interface FolderProps {
  size?: number;
  items?: ReactNode[];
  className?: string;
}

const Folder: FC<FolderProps> = ({
  size = 1,
  items = [],
  className = "",
}) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const folderClassName = `folder ${open ? "open" : ""}`.trim();
  const scaleStyle = { transform: `scale(${size})` };

  return (
    <div style={scaleStyle} className={className}>
      <div
        className={folderClassName}
        onClick={handleClick}
      >
        <div className="folder__back">
          {papers.map((item, i) => (
            <div
              key={i}
              className="paper"
            >
              {item}
            </div>
          ))}
          <div className="folder__front"></div>
          <div className="folder__front right"></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;