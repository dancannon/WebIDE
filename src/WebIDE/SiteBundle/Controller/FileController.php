<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use WebIDE\SiteBundle\Entity\File;
use FOS\RestBundle\View\View;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class FileController extends Controller
{
    public function getFilesAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine();
        $files = $em->getRepository("WebIDESiteBundle:File")->findAll();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($files);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function getFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine();
        $file = $em->getRepository("WebIDESiteBundle:File")->find($id);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function postFilesAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();

        $file = new File();

        //Find project
        $projectRData = $request->get('project');
        $projectId = is_array($projectRData) ? $projectRData['id'] : $projectRData;

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $projectId);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $file->setActive($request->get('active'));
        $file->setSelected($request->get('selected'));
        $file->setResource($request->get('resource'));
        $file->setOrder($request->get('order'));
        $file->setType($request->get('type'));
        $file->setName($request->get('name'));
        $file->setContent($request->get('content'));
        $file->setProject($project);
        $file->setVersion($project->getVersion());

        //TODO: Add validation

        $em->persist($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function putFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();

        $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->findOneBy(array('id' => $id));

        if (!$file) {
            throw $this->createNotFoundException('File not found.');
        }

        //Find project
        $projectId = is_object($request->get('project')) ? $request->get('project')->id : $request->get('project');
        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $projectId);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $file->setActive($request->get('active'));
        $file->setSelected($request->get('selected'));
        $file->setResource($request->get('resource'));
        $file->setOrder($request->get('order'));
        $file->setType($request->get('type'));
        $file->setName($request->get('name'));
        $file->setContent($request->get('content'));
        $file->setProject($project);
        $file->setVersion($project->getVersion());

        //TODO: Add validation

        $em->persist($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($file);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function deleteFileAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();

        $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->findOneBy(array('id' => $id));

        if (!$file) {
            throw $this->createNotFoundException('File not found.');
        }

        $em->remove($file);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200)
            ->setData(array());

        return $this->get('fos_rest.view_handler')->handle($view);
    }
}