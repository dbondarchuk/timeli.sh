import { ComplexAppPageProps } from "@timelish/types";
import { CommentsTable } from "../table/table";
import { CommentsTableAction } from "../table/table-action";

export const BlogCommentsPage: React.FC<ComplexAppPageProps> = ({ appId }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <CommentsTableAction appId={appId} />
      <CommentsTable appId={appId} />
    </div>
  );
};
