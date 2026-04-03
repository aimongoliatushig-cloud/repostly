export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "brand" | "agent";
export type ContentType = "b_roll_head_explainer" | "organ_talk";
export type ProjectStatus =
  | "draft"
  | "planning"
  | "queued"
  | "rendering"
  | "completed"
  | "failed";
export type SceneStatus =
  | "editable"
  | "queued"
  | "rendering"
  | "ready"
  | "failed";
export type JobStatus =
  | "queued"
  | "processing"
  | "retrying"
  | "succeeded"
  | "failed";
export type JobType =
  | "topic_hook"
  | "storyboard"
  | "animation_plan"
  | "script"
  | "scene_video"
  | "scene_voice"
  | "merge";

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        {
          user_id: string;
          role: AppRole;
          full_name: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          role?: AppRole;
          full_name?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          user_id?: string;
          role?: AppRole;
          full_name?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brands: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          phone: string | null;
          website: string | null;
          facebook_url: string | null;
          address: string | null;
          logo_path: string | null;
          frame_path: string | null;
          outro_video_path: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          phone?: string | null;
          website?: string | null;
          facebook_url?: string | null;
          address?: string | null;
          logo_path?: string | null;
          frame_path?: string | null;
          outro_video_path?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          phone?: string | null;
          website?: string | null;
          facebook_url?: string | null;
          address?: string | null;
          logo_path?: string | null;
          frame_path?: string | null;
          outro_video_path?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brand_memberships: TableDefinition<
        {
          brand_id: string;
          user_id: string;
          role: AppRole;
          is_default: boolean;
          created_at: string;
        },
        {
          brand_id: string;
          user_id: string;
          role: AppRole;
          is_default?: boolean;
          created_at?: string;
        },
        {
          brand_id?: string;
          user_id?: string;
          role?: AppRole;
          is_default?: boolean;
          created_at?: string;
        }
      >;
      subscription_plans: TableDefinition<
        {
          id: string;
          plan_code: string;
          name: string;
          credits: number;
          price_mnt: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          plan_code: string;
          name: string;
          credits: number;
          price_mnt: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          plan_code?: string;
          name?: string;
          credits?: number;
          price_mnt?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brand_subscriptions: TableDefinition<
        {
          id: string;
          brand_id: string;
          plan_id: string;
          status: string;
          total_credits: number;
          remaining_credits: number;
          starts_at: string;
          renews_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          brand_id: string;
          plan_id: string;
          status?: string;
          total_credits: number;
          remaining_credits: number;
          starts_at?: string;
          renews_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          brand_id?: string;
          plan_id?: string;
          status?: string;
          total_credits?: number;
          remaining_credits?: number;
          starts_at?: string;
          renews_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      credit_ledger: TableDefinition<
        {
          id: string;
          brand_id: string;
          subscription_id: string | null;
          project_id: string | null;
          delta: number;
          reason: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          brand_id: string;
          subscription_id?: string | null;
          project_id?: string | null;
          delta: number;
          reason: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          brand_id?: string;
          subscription_id?: string | null;
          project_id?: string | null;
          delta?: number;
          reason?: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        }
      >;
      organ_avatars: TableDefinition<
        {
          id: string;
          slug: string;
          label: string;
          description: string;
          default_voice_key: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          label: string;
          description: string;
          default_voice_key?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          slug?: string;
          label?: string;
          description?: string;
          default_voice_key?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      doctors: TableDefinition<
        {
          id: string;
          brand_id: string;
          full_name: string;
          specialization: string;
          image_path: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          brand_id: string;
          full_name: string;
          specialization: string;
          image_path?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          brand_id?: string;
          full_name?: string;
          specialization?: string;
          image_path?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      brand_assets: TableDefinition<
        {
          id: string;
          brand_id: string;
          asset_type: string;
          storage_path: string;
          mime_type: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          brand_id: string;
          asset_type: string;
          storage_path: string;
          mime_type?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          brand_id?: string;
          asset_type?: string;
          storage_path?: string;
          mime_type?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      video_projects: TableDefinition<
        {
          id: string;
          brand_id: string;
          created_by: string | null;
          content_type: ContentType;
          doctor_id: string | null;
          organ_avatar_id: string | null;
          title: string;
          topic: string | null;
          hook: string | null;
          script_text: string | null;
          cta_text: string | null;
          source_audio_path: string | null;
          status: ProjectStatus;
          duration_limit_seconds: number;
          estimated_duration_seconds: number | null;
          apply_frame: boolean;
          apply_outro: boolean;
          seed_group_id: string | null;
          final_video_url: string | null;
          error_message: string | null;
          completed_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          brand_id: string;
          created_by?: string | null;
          content_type: ContentType;
          doctor_id?: string | null;
          organ_avatar_id?: string | null;
          title: string;
          topic?: string | null;
          hook?: string | null;
          script_text?: string | null;
          cta_text?: string | null;
          source_audio_path?: string | null;
          status?: ProjectStatus;
          duration_limit_seconds: number;
          estimated_duration_seconds?: number | null;
          apply_frame?: boolean;
          apply_outro?: boolean;
          seed_group_id?: string | null;
          final_video_url?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          brand_id?: string;
          created_by?: string | null;
          content_type?: ContentType;
          doctor_id?: string | null;
          organ_avatar_id?: string | null;
          title?: string;
          topic?: string | null;
          hook?: string | null;
          script_text?: string | null;
          cta_text?: string | null;
          source_audio_path?: string | null;
          status?: ProjectStatus;
          duration_limit_seconds?: number;
          estimated_duration_seconds?: number | null;
          apply_frame?: boolean;
          apply_outro?: boolean;
          seed_group_id?: string | null;
          final_video_url?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        }
      >;
      project_scenes: TableDefinition<
        {
          id: string;
          project_id: string;
          scene_index: number;
          title: string;
          narration: string | null;
          visual_prompt: string | null;
          animation_prompt: string | null;
          duration_seconds: number;
          status: SceneStatus;
          provider_clip_job_id: string | null;
          seed_id: string | null;
          clip_url: string | null;
          preview_url: string | null;
          error_message: string | null;
          metadata: Json;
          last_generated_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          project_id: string;
          scene_index: number;
          title: string;
          narration?: string | null;
          visual_prompt?: string | null;
          animation_prompt?: string | null;
          duration_seconds: number;
          status?: SceneStatus;
          provider_clip_job_id?: string | null;
          seed_id?: string | null;
          clip_url?: string | null;
          preview_url?: string | null;
          error_message?: string | null;
          metadata?: Json;
          last_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          project_id?: string;
          scene_index?: number;
          title?: string;
          narration?: string | null;
          visual_prompt?: string | null;
          animation_prompt?: string | null;
          duration_seconds?: number;
          status?: SceneStatus;
          provider_clip_job_id?: string | null;
          seed_id?: string | null;
          clip_url?: string | null;
          preview_url?: string | null;
          error_message?: string | null;
          metadata?: Json;
          last_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      generation_jobs: TableDefinition<
        {
          id: string;
          project_id: string;
          scene_id: string | null;
          provider: string;
          job_type: JobType;
          status: JobStatus;
          provider_job_id: string | null;
          request_payload: Json;
          response_payload: Json;
          error_message: string | null;
          retry_count: number;
          available_at: string;
          started_at: string | null;
          finished_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          project_id: string;
          scene_id?: string | null;
          provider: string;
          job_type: JobType;
          status?: JobStatus;
          provider_job_id?: string | null;
          request_payload?: Json;
          response_payload?: Json;
          error_message?: string | null;
          retry_count?: number;
          available_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          project_id?: string;
          scene_id?: string | null;
          provider?: string;
          job_type?: JobType;
          status?: JobStatus;
          provider_job_id?: string | null;
          request_payload?: Json;
          response_payload?: Json;
          error_message?: string | null;
          retry_count?: number;
          available_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_brand_account: {
        Args: {
          target_user_id: string;
          brand_name: string;
          brand_phone?: string | null;
          initial_plan_code?: string | null;
          requested_slug?: string | null;
        };
        Returns: {
          brand_id: string;
          subscription_id: string;
        }[];
      };
      consume_video_credit: {
        Args: {
          target_project_id: string;
          final_url: string;
        };
        Returns: undefined;
      };
      apply_kie_scene_callback: {
        Args: {
          target_project_id: string;
          target_scene_id: string;
          target_provider_job_id: string;
          job_state: string;
          video_url?: string | null;
          fail_message?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: AppRole;
      content_type: ContentType;
      project_status: ProjectStatus;
      scene_status: SceneStatus;
      job_status: JobStatus;
      job_type: JobType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];
