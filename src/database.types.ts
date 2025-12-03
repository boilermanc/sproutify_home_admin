export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      badge_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          rarity: string | null
          sort_order: number | null
          tier: string | null
          trigger_threshold: number | null
          trigger_type: string
          xp_value: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rarity?: string | null
          sort_order?: number | null
          tier?: string | null
          trigger_threshold?: number | null
          trigger_type: string
          xp_value?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rarity?: string | null
          sort_order?: number | null
          tier?: string | null
          trigger_threshold?: number | null
          trigger_type?: string
          xp_value?: number | null
        }
        Relationships: []
      }
      badge_progress: {
        Row: {
          badge_category: string
          current_value: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_category: string
          current_value?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_category?: string
          current_value?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      categories: {
        Row: {
          categorydescription: string | null
          categoryid: number
          categoryimageurl: string | null
          categoryname: string
        }
        Insert: {
          categorydescription?: string | null
          categoryid?: number
          categoryimageurl?: string | null
          categoryname: string
        }
        Update: {
          categorydescription?: string | null
          categoryid?: number
          categoryimageurl?: string | null
          categoryname?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          is_winner: boolean | null
          post_id: string
          user_id: string
          votes_count: number | null
          winner_rank: number | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          post_id: string
          user_id: string
          votes_count?: number | null
          winner_rank?: number | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          post_id?: string
          user_id?: string
          votes_count?: number | null
          winner_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "monthly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      challenge_votes: {
        Row: {
          created_at: string | null
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "challenge_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      community_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          related_badge_id: string | null
          related_post_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_badge_id?: string | null
          related_post_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_badge_id?: string | null
          related_post_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "community_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "fk_community_notifications_badge"
            columns: ["related_badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          caption: string | null
          comments_count: number | null
          created_at: string | null
          featured_type: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_hidden: boolean | null
          likes_count: number | null
          location_city: string | null
          location_state: string | null
          photo_aspect_ratio: number | null
          photo_url: string
          reports_count: number | null
          shares_count: number | null
          tower_id: number | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          featured_type?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          location_city?: string | null
          location_state?: string | null
          photo_aspect_ratio?: number | null
          photo_url: string
          reports_count?: number | null
          shares_count?: number | null
          tower_id?: number | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          featured_type?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          location_city?: string | null
          location_state?: string | null
          photo_aspect_ratio?: number | null
          photo_url?: string
          reports_count?: number | null
          shares_count?: number | null
          tower_id?: number | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "my_towers"
            referencedColumns: ["tower_id"]
          },
          {
            foreignKeyName: "community_posts_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["tower_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      community_stats: {
        Row: {
          active_users_today: number | null
          created_at: string | null
          stat_date: string
          total_badges_earned: number | null
          total_comments: number | null
          total_likes: number | null
          total_posts: number | null
          total_users: number | null
        }
        Insert: {
          active_users_today?: number | null
          created_at?: string | null
          stat_date: string
          total_badges_earned?: number | null
          total_comments?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_users?: number | null
        }
        Update: {
          active_users_today?: number | null
          created_at?: string | null
          stat_date?: string
          total_badges_earned?: number | null
          total_comments?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      ec_values: {
        Row: {
          ec_image_url: string | null
          ec_review: string | null
          ec_review_image_url: string | null
          ec_value: number
          id: number
        }
        Insert: {
          ec_image_url?: string | null
          ec_review?: string | null
          ec_review_image_url?: string | null
          ec_value: number
          id?: number
        }
        Update: {
          ec_image_url?: string | null
          ec_review?: string | null
          ec_review_image_url?: string | null
          ec_value?: number
          id?: number
        }
        Relationships: []
      }
      favorite_toggle_signal: {
        Row: {
          created_at: string | null
          id: number
          plant_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          plant_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          plant_id?: number
          user_id?: string
        }
        Relationships: []
      }
      gardening_experience_levels: {
        Row: {
          level_description: string
          level_id: number
          mailerlite_group_id: number | null
        }
        Insert: {
          level_description: string
          level_id?: number
          mailerlite_group_id?: number | null
        }
        Update: {
          level_description?: string
          level_id?: number
          mailerlite_group_id?: number | null
        }
        Relationships: []
      }
      gardening_goals: {
        Row: {
          goal_description: string
          goal_id: number
        }
        Insert: {
          goal_description: string
          goal_id?: number
        }
        Update: {
          goal_description?: string
          goal_id?: number
        }
        Relationships: []
      }
      gardening_inspirational_messages: {
        Row: {
          body: string
          id: number
          message_date: string | null
          title: string
        }
        Insert: {
          body: string
          id?: number
          message_date?: string | null
          title: string
        }
        Update: {
          body?: string
          id?: number
          message_date?: string | null
          title?: string
        }
        Relationships: []
      }
      gardening_inspirational_messages_backup: {
        Row: {
          body: string | null
          id: number | null
          message_date: string | null
          title: string | null
        }
        Insert: {
          body?: string | null
          id?: number | null
          message_date?: string | null
          title?: string | null
        }
        Update: {
          body?: string | null
          id?: number | null
          message_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      gardening_plant_types: {
        Row: {
          plant_type_description: string
          plant_type_id: number
        }
        Insert: {
          plant_type_description: string
          plant_type_id?: number
        }
        Update: {
          plant_type_description?: string
          plant_type_id?: number
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string | null
          display_tag: string
          id: string
          tag: string
          use_count: number | null
        }
        Insert: {
          created_at?: string | null
          display_tag: string
          id?: string
          tag: string
          use_count?: number | null
        }
        Update: {
          created_at?: string | null
          display_tag?: string
          id?: string
          tag?: string
          use_count?: number | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          created_by: string
          email: string
          expires_at: string | null
          first_name: string
          id: string
          invitation_code: string | null
          last_name: string
          role_id: string
          status: string | null
          updated_at: string | null
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          email: string
          expires_at?: string | null
          first_name: string
          id?: string
          invitation_code?: string | null
          last_name: string
          role_id: string
          status?: string | null
          updated_at?: string | null
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          email?: string
          expires_at?: string | null
          first_name?: string
          id?: string
          invitation_code?: string | null
          last_name?: string
          role_id?: string
          status?: string | null
          updated_at?: string | null
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_challenges: {
        Row: {
          banner_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string
          hashtag: string | null
          id: string
          is_active: boolean | null
          prize_description: string | null
          start_date: string
          theme: string
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          hashtag?: string | null
          id?: string
          is_active?: boolean | null
          prize_description?: string | null
          start_date: string
          theme: string
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          hashtag?: string | null
          id?: string
          is_active?: boolean | null
          prize_description?: string | null
          start_date?: string
          theme?: string
        }
        Relationships: []
      }
      my_towers: {
        Row: {
          archive: boolean | null
          indoor_outdoor: string | null
          port_count: number
          tower_brand_id: number | null
          tower_id: number
          tower_name: string
          user_id: string | null
        }
        Insert: {
          archive?: boolean | null
          indoor_outdoor?: string | null
          port_count: number
          tower_brand_id?: number | null
          tower_id?: number
          tower_name: string
          user_id?: string | null
        }
        Update: {
          archive?: boolean | null
          indoor_outdoor?: string | null
          port_count?: number
          tower_brand_id?: number | null
          tower_id?: number
          tower_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "my_towers_tower_brand_id_fkey"
            columns: ["tower_brand_id"]
            isOneToOne: false
            referencedRelation: "tower_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "my_towers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "my_towers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "my_towers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          description: string | null
          formatted_time_created: string | null
          id: number
          status: boolean
          time_created: string
          title: string | null
        }
        Insert: {
          description?: string | null
          formatted_time_created?: string | null
          id?: number
          status?: boolean
          time_created?: string
          title?: string | null
        }
        Update: {
          description?: string | null
          formatted_time_created?: string | null
          id?: number
          status?: boolean
          time_created?: string
          title?: string | null
        }
        Relationships: []
      }
      pest_content: {
        Row: {
          category_id: number | null
          content_body: string
          content_id: number
          content_image_url: string | null
          content_resource_url: string | null
          content_title: string
        }
        Insert: {
          category_id?: number | null
          content_body: string
          content_id?: number
          content_image_url?: string | null
          content_resource_url?: string | null
          content_title: string
        }
        Update: {
          category_id?: number | null
          content_body?: string
          content_id?: number
          content_image_url?: string | null
          content_resource_url?: string | null
          content_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "pestmanagementcategory"
            referencedColumns: ["category_id"]
          },
        ]
      }
      pestmanagementcategory: {
        Row: {
          category_id: number
          category_image_url: string | null
          category_name: string
          category_type: string
        }
        Insert: {
          category_id?: number
          category_image_url?: string | null
          category_name: string
          category_type: string
        }
        Update: {
          category_id?: number
          category_image_url?: string | null
          category_name?: string
          category_type?: string
        }
        Relationships: []
      }
      ph_echistory: {
        Row: {
          created_at: string | null
          ec_value: number | null
          history_id: number
          ph_value: number | null
          timestamp: string
          tower_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ec_value?: number | null
          history_id?: number
          ph_value?: number | null
          timestamp: string
          tower_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ec_value?: number | null
          history_id?: number
          ph_value?: number | null
          timestamp?: string
          tower_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ph_echistory_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "my_towers"
            referencedColumns: ["tower_id"]
          },
          {
            foreignKeyName: "ph_echistory_tower_id_fkey"
            columns: ["tower_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["tower_id"]
          },
        ]
      }
      ph_values: {
        Row: {
          id: number
          image_url: string | null
          ph_review: string | null
          ph_value: number
          review_image_url: string | null
        }
        Insert: {
          id?: number
          image_url?: string | null
          ph_review?: string | null
          ph_value: number
          review_image_url?: string | null
        }
        Update: {
          id?: number
          image_url?: string | null
          ph_review?: string | null
          ph_value?: number
          review_image_url?: string | null
        }
        Relationships: []
      }
      plant_category: {
        Row: {
          category_id: number
          created_at: string
          desc: string | null
          plant_catagory: string | null
        }
        Insert: {
          category_id?: number
          created_at?: string
          desc?: string | null
          plant_catagory?: string | null
        }
        Update: {
          category_id?: number
          created_at?: string
          desc?: string | null
          plant_catagory?: string | null
        }
        Relationships: []
      }
      plant_category_relation: {
        Row: {
          category_id: number
          plant_id: number
        }
        Insert: {
          category_id: number
          plant_id: number
        }
        Update: {
          category_id?: number
          plant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "plant_category_relation_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "plant_category"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "highly_rated_picks"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_catalog"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_overall_ratings"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "quick_harvest_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_favorite_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "plant_category_relation_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "view_plant_details_by_category"
            referencedColumns: ["plant_id"]
          },
        ]
      }
      plantratings: {
        Row: {
          ratingdescription: string
          ratingnumber: number
          title: string | null
        }
        Insert: {
          ratingdescription: string
          ratingnumber: number
          title?: string | null
        }
        Update: {
          ratingdescription?: string
          ratingnumber?: number
          title?: string | null
        }
        Relationships: []
      }
      plants: {
        Row: {
          average_rating: number | null
          best_placement: string | null
          final_harvest: string | null
          first_harvest: string | null
          growing_season: string | null
          harvest_method: string | null
          indoor_outdoor: string | null
          long_description: string | null
          plant_id: number
          plant_image: string | null
          plant_name: string
          short_description: string | null
        }
        Insert: {
          average_rating?: number | null
          best_placement?: string | null
          final_harvest?: string | null
          first_harvest?: string | null
          growing_season?: string | null
          harvest_method?: string | null
          indoor_outdoor?: string | null
          long_description?: string | null
          plant_id?: number
          plant_image?: string | null
          plant_name: string
          short_description?: string | null
        }
        Update: {
          average_rating?: number | null
          best_placement?: string | null
          final_harvest?: string | null
          first_harvest?: string | null
          growing_season?: string | null
          harvest_method?: string | null
          indoor_outdoor?: string | null
          long_description?: string | null
          plant_id?: number
          plant_image?: string | null
          plant_name?: string
          short_description?: string | null
        }
        Relationships: []
      }
      post_bookmarks: {
        Row: {
          collection_name: string | null
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          collection_name?: string | null
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          collection_name?: string | null
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      post_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          likes_count: number | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string | null
          hashtag_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          hashtag_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          hashtag_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      post_plant_tags: {
        Row: {
          created_at: string | null
          id: string
          plant_id: number
          post_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plant_id: number
          post_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plant_id?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "highly_rated_picks"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_catalog"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_overall_ratings"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "quick_harvest_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_favorite_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "view_plant_details_by_category"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "post_plant_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          additional_info: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          post_id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          post_id: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          user_id: string
        }
        Update: {
          additional_info?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          post_id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      products: {
        Row: {
          affiliatelink: string | null
          categoryid: number | null
          description: string | null
          directions: string | null
          imageurl: string | null
          isactive: boolean | null
          isvisible: boolean | null
          price: number
          productid: number
          productname: string
          quantity: number | null
          short_description: string | null
          subcategoryid: number | null
          tfflag: boolean | null
          vendorid: number | null
        }
        Insert: {
          affiliatelink?: string | null
          categoryid?: number | null
          description?: string | null
          directions?: string | null
          imageurl?: string | null
          isactive?: boolean | null
          isvisible?: boolean | null
          price: number
          productid?: number
          productname: string
          quantity?: number | null
          short_description?: string | null
          subcategoryid?: number | null
          tfflag?: boolean | null
          vendorid?: number | null
        }
        Update: {
          affiliatelink?: string | null
          categoryid?: number | null
          description?: string | null
          directions?: string | null
          imageurl?: string | null
          isactive?: boolean | null
          isvisible?: boolean | null
          price?: number
          productid?: number
          productname?: string
          quantity?: number | null
          short_description?: string | null
          subcategoryid?: number | null
          tfflag?: boolean | null
          vendorid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["categoryid"]
          },
          {
            foreignKeyName: "products_subcategoryid_fkey"
            columns: ["subcategoryid"]
            isOneToOne: false
            referencedRelation: "products_subcategories"
            referencedColumns: ["subcategoryid"]
          },
          {
            foreignKeyName: "products_vendorid_fkey"
            columns: ["vendorid"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendorid"]
          },
        ]
      }
      products_subcategories: {
        Row: {
          categoryid: number | null
          subcategoryid: number
          subcategoryname: string
        }
        Insert: {
          categoryid?: number | null
          subcategoryid?: number
          subcategoryname: string
        }
        Update: {
          categoryid?: number | null
          subcategoryid?: number
          subcategoryname?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["categoryid"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          day2_email_sent: boolean | null
          day4_email_sent: boolean | null
          day6_email_sent: boolean | null
          email: string | null
          first_login_email_sent: boolean | null
          first_name: string | null
          gardening_experience:
            | Database["public"]["Enums"]["gardening_experience_level"]
            | null
          id: string
          last_name: string | null
          last_notification_read_time: string | null
          mailerlite_group_id: number | null
          offer_code: string | null
          postal_code: string | null
          revenue_cat_customer_id: string | null
          state: string | null
          subscription_end_date: string | null
          subscription_platform: string | null
          subscription_start_date: string | null
          trial_banner_dismissed_at: string | null
          trial_converted_at: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_status: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          day2_email_sent?: boolean | null
          day4_email_sent?: boolean | null
          day6_email_sent?: boolean | null
          email?: string | null
          first_login_email_sent?: boolean | null
          first_name?: string | null
          gardening_experience?:
            | Database["public"]["Enums"]["gardening_experience_level"]
            | null
          id: string
          last_name?: string | null
          last_notification_read_time?: string | null
          mailerlite_group_id?: number | null
          offer_code?: string | null
          postal_code?: string | null
          revenue_cat_customer_id?: string | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_platform?: string | null
          subscription_start_date?: string | null
          trial_banner_dismissed_at?: string | null
          trial_converted_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_status?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          day2_email_sent?: boolean | null
          day4_email_sent?: boolean | null
          day6_email_sent?: boolean | null
          email?: string | null
          first_login_email_sent?: boolean | null
          first_name?: string | null
          gardening_experience?:
            | Database["public"]["Enums"]["gardening_experience_level"]
            | null
          id?: string
          last_name?: string | null
          last_notification_read_time?: string | null
          mailerlite_group_id?: number | null
          offer_code?: string | null
          postal_code?: string | null
          revenue_cat_customer_id?: string | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_platform?: string | null
          subscription_start_date?: string | null
          trial_banner_dismissed_at?: string | null
          trial_converted_at?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_status?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      tower_brands: {
        Row: {
          allow_custom_name: boolean | null
          brand_logo_url: string | null
          brand_name: string | null
          created_at: string
          display_order: number | null
          id: number
          is_active: boolean
        }
        Insert: {
          allow_custom_name?: boolean | null
          brand_logo_url?: string | null
          brand_name?: string | null
          created_at?: string
          display_order?: number | null
          id?: number
          is_active?: boolean
        }
        Update: {
          allow_custom_name?: boolean | null
          brand_logo_url?: string | null
          brand_name?: string | null
          created_at?: string
          display_order?: number | null
          id?: number
          is_active?: boolean
        }
        Relationships: []
      }
      tower_faq: {
        Row: {
          answer: string | null
          category: string | null
          id: number
          links: string | null
          question: string | null
          tsvector_col: unknown
        }
        Insert: {
          answer?: string | null
          category?: string | null
          id: number
          links?: string | null
          question?: string | null
          tsvector_col?: unknown
        }
        Update: {
          answer?: string | null
          category?: string | null
          id?: number
          links?: string | null
          question?: string | null
          tsvector_col?: unknown
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          showcased: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          showcased?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          showcased?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_community_profiles: {
        Row: {
          bio: string | null
          followers_count: number | null
          following_count: number | null
          is_public: boolean | null
          joined_community_at: string | null
          posts_count: number | null
          profile_photo_url: string | null
          show_location: boolean | null
          show_stats: boolean | null
          total_likes_received: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          followers_count?: number | null
          following_count?: number | null
          is_public?: boolean | null
          joined_community_at?: string | null
          posts_count?: number | null
          profile_photo_url?: string | null
          show_location?: boolean | null
          show_stats?: boolean | null
          total_likes_received?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          followers_count?: number | null
          following_count?: number | null
          is_public?: boolean | null
          joined_community_at?: string | null
          posts_count?: number | null
          profile_photo_url?: string | null
          show_location?: boolean | null
          show_stats?: boolean | null
          total_likes_received?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_community_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_community_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_community_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          favorite_id: number
          is_favorite: boolean | null
          plant_id: number
          user_id: string | null
        }
        Insert: {
          favorite_id?: number
          is_favorite?: boolean | null
          plant_id: number
          user_id?: string | null
        }
        Update: {
          favorite_id?: number
          is_favorite?: boolean | null
          plant_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "highly_rated_picks"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_catalog"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_overall_ratings"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "quick_harvest_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_favorite_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "view_plant_details_by_category"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          badges_earned: number | null
          current_level: number | null
          current_streak: number | null
          last_activity_date: string | null
          last_badge_earned_at: string | null
          longest_streak: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges_earned?: number | null
          current_level?: number | null
          current_streak?: number | null
          last_activity_date?: string | null
          last_badge_earned_at?: string | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges_earned?: number | null
          current_level?: number | null
          current_streak?: number | null
          last_activity_date?: string | null
          last_badge_earned_at?: string | null
          longest_streak?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_gardening_experience: {
        Row: {
          level_id: number
          profile_id: string
        }
        Insert: {
          level_id: number
          profile_id: string
        }
        Update: {
          level_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_experience_level"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "gardening_experience_levels"
            referencedColumns: ["level_id"]
          },
          {
            foreignKeyName: "fk_profile_experience"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "all_unread_notifications"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_profile_experience"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profile_experience"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_goals"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_profile_experience"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_plant_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_profile_experience"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_gardening_goals: {
        Row: {
          goal_id: number
          profile_id: string
        }
        Insert: {
          goal_id: number
          profile_id: string
        }
        Update: {
          goal_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_goal"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "gardening_goals"
            referencedColumns: ["goal_id"]
          },
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "all_unread_notifications"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_goals"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_plant_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_gardening_plant_preferences: {
        Row: {
          plant_type_id: number
          profile_id: string
        }
        Insert: {
          plant_type_id: number
          profile_id: string
        }
        Update: {
          plant_type_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_plant_type"
            columns: ["plant_type_id"]
            isOneToOne: false
            referencedRelation: "gardening_plant_types"
            referencedColumns: ["plant_type_id"]
          },
          {
            foreignKeyName: "fk_profile_plant"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "all_unread_notifications"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_profile_plant"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profile_plant"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_goals"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_profile_plant"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_plant_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "fk_profile_plant"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_notifications_status: {
        Row: {
          notification_id: number
          read_at: string
          status: string
          user_id: string
        }
        Insert: {
          notification_id: number
          read_at?: string
          status?: string
          user_id: string
        }
        Update: {
          notification_id?: number
          read_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_read_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "all_unread_notifications"
            referencedColumns: ["notification_id"]
          },
          {
            foreignKeyName: "user_notifications_read_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "all_unread_notifications"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_notifications_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_goals"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_with_plant_preferences"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_notifications_read_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      userplant_actions: {
        Row: {
          action_date: string | null
          action_id: number
          action_quantity: number | null
          action_type: string
          user_plant_id: number
        }
        Insert: {
          action_date?: string | null
          action_id?: number
          action_quantity?: number | null
          action_type: string
          user_plant_id: number
        }
        Update: {
          action_date?: string | null
          action_id?: number
          action_quantity?: number | null
          action_type?: string
          user_plant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "userplant_actions_user_plant_id_fkey"
            columns: ["user_plant_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_plant_id"]
          },
          {
            foreignKeyName: "userplant_actions_user_plant_id_fkey"
            columns: ["user_plant_id"]
            isOneToOne: false
            referencedRelation: "userplants"
            referencedColumns: ["user_plant_id"]
          },
        ]
      }
      userplants: {
        Row: {
          added_on: string
          archived: boolean | null
          plant_cost: number | null
          plant_id: number | null
          rating: number | null
          user_id: string | null
          user_plant_id: number
        }
        Insert: {
          added_on?: string
          archived?: boolean | null
          plant_cost?: number | null
          plant_id?: number | null
          rating?: number | null
          user_id?: string | null
          user_plant_id?: number
        }
        Update: {
          added_on?: string
          archived?: boolean | null
          plant_cost?: number | null
          plant_id?: number | null
          rating?: number | null
          user_id?: string | null
          user_plant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "highly_rated_picks"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "indoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "outdoor_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_catalog"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plant_overall_ratings"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "quick_harvest_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "user_favorite_plants"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "view_plant_details_by_category"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "userplants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "userplants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "userplants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      userproducts: {
        Row: {
          archive: boolean | null
          productid: number | null
          userid: string | null
          userproductid: number
          userpurchasecost: number | null
          userpurchasedate: string | null
          userpurchasedquantity: number | null
        }
        Insert: {
          archive?: boolean | null
          productid?: number | null
          userid?: string | null
          userproductid?: number
          userpurchasecost?: number | null
          userpurchasedate?: string | null
          userpurchasedquantity?: number | null
        }
        Update: {
          archive?: boolean | null
          productid?: number | null
          userid?: string | null
          userproductid?: number
          userpurchasecost?: number | null
          userpurchasedate?: string | null
          userpurchasedquantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "userproducts_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "userproducts_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products_with_vendors"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "userproducts_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "userproductlistview"
            referencedColumns: ["productid"]
          },
          {
            foreignKeyName: "userproducts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "userproducts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "userproducts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      users: {
        Row: {
          is_admin: boolean | null
          role: string
          user_id: number
        }
        Insert: {
          is_admin?: boolean | null
          role?: string
          user_id?: number
        }
        Update: {
          is_admin?: boolean | null
          role?: string
          user_id?: number
        }
        Relationships: []
      }
      vendors: {
        Row: {
          city: string | null
          contactemail: string | null
          contactname: string | null
          contactphone: string | null
          country: string | null
          postalcode: string | null
          state: string | null
          streetaddress: string | null
          vendorid: number
          vendorname: string
          website: string | null
        }
        Insert: {
          city?: string | null
          contactemail?: string | null
          contactname?: string | null
          contactphone?: string | null
          country?: string | null
          postalcode?: string | null
          state?: string | null
          streetaddress?: string | null
          vendorid?: number
          vendorname: string
          website?: string | null
        }
        Update: {
          city?: string | null
          contactemail?: string | null
          contactname?: string | null
          contactphone?: string | null
          country?: string | null
          postalcode?: string | null
          state?: string | null
          streetaddress?: string | null
          vendorid?: number
          vendorname?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      all_unread_notifications: {
        Row: {
          description: string | null
          notification_id: number | null
          time_created: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      highly_rated_picks: {
        Row: {
          average_rating: number | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
        }
        Insert: {
          average_rating?: number | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Update: {
          average_rating?: number | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Relationships: []
      }
      indoor_outdoor_plants: {
        Row: {
          average_rating: number | null
          indoor_outdoor: string | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
        }
        Insert: {
          average_rating?: number | null
          indoor_outdoor?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Update: {
          average_rating?: number | null
          indoor_outdoor?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Relationships: []
      }
      indoor_plants: {
        Row: {
          average_rating: number | null
          indoor_outdoor: string | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
        }
        Insert: {
          average_rating?: number | null
          indoor_outdoor?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Update: {
          average_rating?: number | null
          indoor_outdoor?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Relationships: []
      }
      outdoor_plants: {
        Row: {
          average_rating: number | null
          indoor_outdoor: string | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
        }
        Insert: {
          average_rating?: number | null
          indoor_outdoor?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Update: {
          average_rating?: number | null
          indoor_outdoor?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Relationships: []
      }
      plant_catalog: {
        Row: {
          plant_id: number | null
          plant_name: string | null
          plant_url: string | null
        }
        Insert: {
          plant_id?: number | null
          plant_name?: string | null
          plant_url?: string | null
        }
        Update: {
          plant_id?: number | null
          plant_name?: string | null
          plant_url?: string | null
        }
        Relationships: []
      }
      plant_overall_ratings: {
        Row: {
          average_rating: number | null
          highest_rating: number | null
          lowest_rating: number | null
          plant_id: number | null
          plant_name: string | null
          total_ratings: number | null
        }
        Relationships: []
      }
      products_with_vendors: {
        Row: {
          affiliatelink: string | null
          description: string | null
          imageurl: string | null
          productid: number | null
          productname: string | null
          vendorid: number | null
          vendorname: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendorid_fkey"
            columns: ["vendorid"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendorid"]
          },
        ]
      }
      quick_harvest_plants: {
        Row: {
          average_rating: number | null
          final_harvest: string | null
          first_harvest: string | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
        }
        Insert: {
          average_rating?: number | null
          final_harvest?: string | null
          first_harvest?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Update: {
          average_rating?: number | null
          final_harvest?: string | null
          first_harvest?: string | null
          plant_id?: number | null
          plant_image?: string | null
          plant_name?: string | null
          short_description?: string | null
        }
        Relationships: []
      }
      user_favorite_plants: {
        Row: {
          is_favorite: boolean | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          rating: number | null
          short_description: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_profiles_with_goals: {
        Row: {
          email: string | null
          gardening_goals: string | null
          profile_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      user_profiles_with_plant_preferences: {
        Row: {
          email: string | null
          plant_preferences: string | null
          profile_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      userplantdetails: {
        Row: {
          archived: boolean | null
          best_placement: string | null
          entry_date: string | null
          final_harvest: string | null
          first_harvest: string | null
          growing_season: string | null
          harvest_method: string | null
          indoor_outdoor: string | null
          is_favorite: boolean | null
          plant_cost: number | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
          user_email: string | null
          user_id: string | null
          user_plant_id: number | null
          user_rating: number | null
        }
        Relationships: []
      }
      userproductlistview: {
        Row: {
          archive: boolean | null
          description: string | null
          productid: number | null
          productname: string | null
          userid: string | null
          userproductid: number | null
          userpurchasecost: number | null
          userpurchasedate: string | null
          userpurchasedquantity: number | null
          vendorname: string | null
        }
        Relationships: [
          {
            foreignKeyName: "userproducts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "userproducts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "userproducts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      usertowerdetails: {
        Row: {
          archive: boolean | null
          ec_image_url: string | null
          ec_review: string | null
          ec_review_image_url: string | null
          indoor_outdoor: string | null
          latest_ec_value: number | null
          latest_ph_value: number | null
          ph_image_url: string | null
          ph_review: string | null
          ports: number | null
          review_image_url: string | null
          tg_corp_image: string | null
          tower_id: number | null
          tower_name: string | null
          tower_type: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_user_profiles: {
        Row: {
          auth_created_at: string | null
          auth_email: string | null
          auth_user_id: string | null
          last_sign_in_at: string | null
          profile_created_at: string | null
          profile_email: string | null
          profile_id: string | null
          profile_updated_at: string | null
          raw_user_meta_data: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "userplantdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "usertowerdetails"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_user_profiles"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      view_plant_details_by_category: {
        Row: {
          average_rating: number | null
          best_placement: string | null
          category_id: number | null
          final_harvest: string | null
          first_harvest: string | null
          growing_season: string | null
          harvest_method: string | null
          indoor_outdoor: string | null
          long_description: string | null
          plant_id: number | null
          plant_image: string | null
          plant_name: string | null
          short_description: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_category_relation_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "plant_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
    }
    Functions: {
      apply_offer_code: {
        Args: { code: string; extra_days?: number; user_uuid: string }
        Returns: {
          message: string
          new_trial_end_date: string
          success: boolean
        }[]
      }
      archive_user_notification: {
        Args: { notification_id_arg: number; user_uuid: string }
        Returns: undefined
      }
      calculate_all_yearly_costs_by_category:
        | {
            Args: { _userid: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.calculate_all_yearly_costs_by_category(_userid => json), public.calculate_all_yearly_costs_by_category(_userid => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
        | {
            Args: { _userid: Json }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.calculate_all_yearly_costs_by_category(_userid => json), public.calculate_all_yearly_costs_by_category(_userid => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
      calculate_costs: { Args: { _user_id: string }; Returns: Json }
      check_and_award_badges: {
        Args: { p_trigger_type: string; p_user_id: string }
        Returns: Json
      }
      check_and_update_trial_status: {
        Args: { user_uuid: string }
        Returns: {
          days_remaining: number
          is_banner_dismissed: boolean
          status: string
          trial_end_date: string
        }[]
      }
      check_if_new_notifications_exist: {
        Args: { _user_id: string }
        Returns: boolean
      }
      convert_trial_to_subscription: {
        Args: {
          duration_days?: number
          platform?: string
          rc_customer_id?: string
          user_uuid: string
        }
        Returns: undefined
      }
      create_community_post: {
        Args: {
          p_caption?: string
          p_hashtag_tags?: string[]
          p_location_city?: string
          p_location_state?: string
          p_photo_aspect_ratio?: number
          p_photo_url: string
          p_plant_ids?: number[]
          p_tower_id?: number
          p_user_id: string
        }
        Returns: Json
      }
      delete_user_by_email: { Args: { target_email: string }; Returns: string }
      delete_user_notification: {
        Args: { notification_id_arg: number; user_uuid: string }
        Returns: undefined
      }
      dismiss_trial_banner: { Args: { user_uuid: string }; Returns: undefined }
      fetch_unread_notifications: {
        Args: { _user_id: string }
        Returns: {
          description: string | null
          formatted_time_created: string | null
          id: number
          status: boolean
          time_created: string
          title: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_active_user_notifications: {
        Args: { user_uuid: string }
        Returns: {
          description: string
          formatted_time_created: string
          notification_id: number
          notification_status: string
          time_created: string
          title: string
        }[]
      }
      get_archived_user_notifications: {
        Args: { _user_id: string }
        Returns: {
          description: string
          formatted_time_created: string
          is_new: boolean
          notification_id: number
          time_created: string
          title: string
        }[]
      }
      get_personalized_feed: {
        Args: {
          p_feed_type?: string
          p_limit?: number
          p_offset?: number
          p_user_id: string
        }
        Returns: {
          caption: string
          comments_count: number
          created_at: string
          featured_type: string
          hashtags: Json
          is_bookmarked_by_user: boolean
          is_featured: boolean
          is_liked_by_user: boolean
          likes_count: number
          location_city: string
          location_state: string
          photo_aspect_ratio: number
          photo_url: string
          plant_tags: Json
          post_id: string
          post_user_id: string
          relevance_score: number
          tower_name: string
          user_photo: string
          username: string
          view_count: number
        }[]
      }
      get_plant_costs: { Args: { _user_id: string }; Returns: Json }
      get_user_badges: {
        Args: { p_filter?: string; p_user_id: string }
        Returns: Json
      }
      get_users_for_trial_emails: {
        Args: { day_number: number }
        Returns: {
          days_remaining: number
          email: string
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      mark_trial_email_sent: {
        Args: { day_number: number; user_uuid: string }
        Returns: undefined
      }
      refresh_usertowerdetails: { Args: never; Returns: undefined }
      search_tower_faq: { Args: { searchterm: string }; Returns: Json }
      search_userplantdetails: {
        Args: { p_search_term: string }
        Returns: Json
      }
      toggle_favorite: {
        Args: { plant: number; user_uuid: string }
        Returns: undefined
      }
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: Json
      }
      total_cost_plant_by_user:
        | { Args: never; Returns: number }
        | { Args: { _user_id: string }; Returns: number }
      total_plant_cost_by_plant_by_user: { Args: never; Returns: number }
      upsert_or_ignore_plant_rating: {
        Args: {
          input_plant_id: number
          input_rating: number
          input_user_id: string
          input_user_plant_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      gardening_experience_level:
        | "Beginner"
        | "Novice"
        | "Intermediate"
        | "Advanced"
        | "Expert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gardening_experience_level: [
        "Beginner",
        "Novice",
        "Intermediate",
        "Advanced",
        "Expert",
      ],
    },
  },
} as const





