import { ComplexAppPageProps } from "@timelish/types";
import { BlogTable } from "../table/table";
import { BlogTableAction } from "../table/table-action";

export const BlogPage: React.FC<ComplexAppPageProps> = ({ appId }) => {
  return (
    <div className="flex flex-col flex-1 gap-8">
      <BlogTableAction appId={appId} />
      <BlogTable appId={appId} />
    </div>
  );
};
