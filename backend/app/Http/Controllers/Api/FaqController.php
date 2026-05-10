<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FaqController extends Controller
{
    /**
     * Tampilkan semua FAQ (dengan pagination)
     */
    public function index(Request $request): JsonResponse
    {
        $faqs = Faq::when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
            })
            ->when($request->category, fn($q, $c) => $q->where('category', $c))
            ->orderBy('view_count', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data'    => $faqs,
        ]);
    }

    /**
     * Simpan FAQ baru
     */
    public function store(Request $request): JsonResponse
    {
        // Hanya admin / master_admin yang boleh membuat FAQ
        if (!in_array($request->user()->role, ['admin', 'master_admin'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title'      => 'required|string|max:500',
            'content'    => 'required|string',
            'category'   => 'nullable|string|max:100',
            'keywords'   => 'nullable|array',
            'keywords.*' => 'string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $faq = Faq::create([
            'title'      => $request->title,
            'content'    => $request->content,
            'category'   => $request->category,
            'keywords'   => $request->keywords ? json_encode($request->keywords) : null,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $faq,
            'message' => 'FAQ berhasil dibuat',
        ], 201);
    }

    /**
     * Tampilkan satu FAQ
     */
    public function show(int $id): JsonResponse
    {
        $faq = Faq::findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $faq,
        ]);
    }

    /**
     * Update FAQ
     */
    public function update(Request $request, int $id): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'master_admin'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $faq = Faq::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title'      => 'sometimes|string|max:500',
            'content'    => 'sometimes|string',
            'category'   => 'nullable|string|max:100',
            'keywords'   => 'nullable|array',
            'keywords.*' => 'string|max:100',
            'is_active'  => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $faq->update(array_filter([
            'title'     => $request->title,
            'content'   => $request->content,
            'category'  => $request->category,
            'keywords'  => $request->keywords ? json_encode($request->keywords) : null,
            'is_active' => $request->is_active,
        ], fn($v) => $v !== null));

        return response()->json([
            'success' => true,
            'data'    => $faq->fresh(),
            'message' => 'FAQ berhasil diperbarui',
        ]);
    }

    /**
     * Hapus FAQ
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'master_admin'])) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $faq = Faq::findOrFail($id);
        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQ berhasil dihapus',
        ]);
    }
}
