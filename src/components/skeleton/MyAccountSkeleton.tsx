const AccountPageSkeleton = () => {
  return (
    <>
      {/* Breadcrumb Skeleton */}
      <div className="bg-gray-2 py-10">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="h-8 bg-gray-3 rounded w-48 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            
            {/* Sidebar Skeleton */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1 animate-pulse">
              {/* User Info */}
              <div className="flex items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-b border-gray-3">
                <div className="w-16 h-16 rounded-full bg-gray-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-2 rounded w-32"></div>
                  <div className="h-3 bg-gray-2 rounded w-24"></div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 sm:p-7.5 xl:p-9 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 py-3 px-4.5 bg-gray-1 rounded-md"
                  >
                    <div className="w-5 h-5 bg-gray-3 rounded"></div>
                    <div className="h-4 bg-gray-3 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10 animate-pulse">
              {/* Title */}
              <div className="h-6 bg-gray-2 rounded w-48 mb-6"></div>
              
              {/* Content Blocks */}
              <div className="space-y-4">
                <div className="h-4 bg-gray-2 rounded w-full"></div>
                <div className="h-4 bg-gray-2 rounded w-5/6"></div>
                <div className="h-4 bg-gray-2 rounded w-4/6"></div>
              </div>

              {/* Form-like Structure */}
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-2 rounded w-20"></div>
                    <div className="h-10 bg-gray-2 rounded w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-2 rounded w-20"></div>
                    <div className="h-10 bg-gray-2 rounded w-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 bg-gray-2 rounded w-24"></div>
                  <div className="h-10 bg-gray-2 rounded w-full"></div>
                </div>

                {/* Button */}
                <div className="h-11 bg-gray-2 rounded w-32"></div>
              </div>

              {/* Second Section */}
              <div className="mt-12 space-y-6">
                <div className="h-6 bg-gray-2 rounded w-40"></div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-2 rounded w-28"></div>
                    <div className="h-10 bg-gray-2 rounded w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-2 rounded w-28"></div>
                    <div className="h-10 bg-gray-2 rounded w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-2 rounded w-36"></div>
                    <div className="h-10 bg-gray-2 rounded w-full"></div>
                  </div>
                </div>

                <div className="h-11 bg-gray-2 rounded w-40"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AccountPageSkeleton;