import React from 'react';
import { useData } from '@/context/DataContext';
import { Youtube, ExternalLink, Play, Users, Video } from 'lucide-react';

export default function YoutubeChannels() {
  const { youtubeChannels } = useData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">YouTube Channels</h1>
        <p className="mt-2 text-gray-600">
          Explore our official YouTube channels for additional content and updates
        </p>
      </div>

      {/* Featured Channel Banner */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Official PromoHub Channel</h2>
            <p className="text-lg opacity-90 mb-4">
              Get the latest updates, tutorials, and success stories from our community
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>50K+ Subscribers</span>
              </div>
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-1" />
                <span>200+ Videos</span>
              </div>
              <div className="flex items-center">
                <Play className="w-4 h-4 mr-1" />
                <span>1M+ Views</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Youtube className="w-16 h-16 mb-4 opacity-80" />
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>

      {/* Channel Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <Youtube className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Content</h3>
          <p className="text-gray-600 text-sm">
            Comprehensive training videos to help you master promotional strategies
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Stories</h3>
          <p className="text-gray-600 text-sm">
            Real testimonials and success stories from our community members
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Sessions</h3>
          <p className="text-gray-600 text-sm">
            Interactive live sessions with experts and community leaders
          </p>
        </div>
      </div>

      {/* Channels Grid */}
      {youtubeChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youtubeChannels.map((channel) => (
            <div key={channel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Channel Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-red-500 to-pink-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Youtube className="w-16 h-16 text-white opacity-80" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                    LIVE
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{channel.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>12.5K</span>
                    </div>
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-1" />
                      <span>45 videos</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(channel.url, '_blank')}
                      className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </button>
                    <button
                      onClick={() => window.open(channel.url, '_blank')}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <Youtube className="w-3 h-3 mr-1" />
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Youtube className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No YouTube Channels Available</h3>
          <p className="mt-2 text-gray-600">
            YouTube channels will be added soon. Stay tuned for exciting content!
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
        <div className="text-center">
          <Youtube className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Stay Connected</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our YouTube channels to get the latest training content, success stories, 
            and live sessions. Don't miss out on valuable insights that can boost your earnings!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              <Youtube className="w-5 h-5 mr-2" />
              Subscribe to All Channels
            </button>
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <ExternalLink className="w-5 h-5 mr-2" />
              Visit YouTube
            </button>
          </div>
        </div>
      </div>

      {/* Video Categories */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Video Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Training Basics', count: 25, color: 'bg-blue-100 text-blue-800' },
            { name: 'Advanced Strategies', count: 18, color: 'bg-green-100 text-green-800' },
            { name: 'Success Stories', count: 32, color: 'bg-purple-100 text-purple-800' },
            { name: 'Live Q&A', count: 12, color: 'bg-orange-100 text-orange-800' }
          ].map((category) => (
            <div key={category.name} className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-lg font-semibold text-gray-900 mb-1">{category.name}</div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${category.color}`}>
                {category.count} videos
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}