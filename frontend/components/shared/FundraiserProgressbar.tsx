import React from 'react'
import { Post } from '../types'

const FundraiserProgressbar = (post: Post) => {
  return (
    <div>
        {post.category === "fundraiser" && post.fundraiserDetails && (
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                        Raised: LKR {post.fundraiserDetails.received.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                        Goal: LKR {post.fundraiserDetails.goal.toLocaleString()}
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                        style={{
                            width: `${Math.min((post.fundraiserDetails.received / post.fundraiserDetails.goal) * 100, 100)}%`
                        }}
                    />
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {((post.fundraiserDetails.received / post.fundraiserDetails.goal) * 100).toFixed(1)}% reached
                </div>
            </div>
        )}
    </div>
  )
}

export default FundraiserProgressbar